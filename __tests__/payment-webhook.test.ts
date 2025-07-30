// __tests__/payment-webhook.test.ts

// --- Types for better TypeScript support ---
interface User {
  id: string;
  email: string;
  tier: 'free' | 'pro' | 'advanced' | 'admin';
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'cancelled' | 'past_due' | 'trialing';
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
}

interface UserDatabase {
  [key: string]: User;
}

interface WebhookPayload {
  event_type: string;
  data: {
    customer: {
      email: string;
      id?: string;
    };
    subscription?: {
      id: string;
      status: string;
      started_at?: string;
      next_billed_at?: string;
    };
    items?: Array<{
      price: {
        product_id: string;
      };
    }>;
  };
}

interface WebhookResult {
  status: 'success' | 'error';
  message?: string;
  updatedUser?: User;
  action?: string;
}

// --- Mock Data ---
const mockUserDatabase: UserDatabase = {
  'user-123': { 
    id: 'user-123', 
    email: 'test@example.com', 
    tier: 'free',
    subscriptionStatus: undefined
  },
  'user-456': { 
    id: 'user-456', 
    email: 'pro@example.com', 
    tier: 'pro',
    subscriptionId: 'sub_existing',
    subscriptionStatus: 'active'
  },
  'user-789': { 
    id: 'user-789', 
    email: 'advanced@example.com', 
    tier: 'advanced',
    subscriptionId: 'sub_advanced',
    subscriptionStatus: 'active'
  }
};

const mockSubscriptionCreatedPayload: WebhookPayload = {
  event_type: 'subscription_created',
  data: {
    customer: { email: 'test@example.com' },
    subscription: {
      id: 'sub_new_123',
      status: 'active',
      started_at: '2024-01-01T00:00:00Z',
      next_billed_at: '2024-02-01T00:00:00Z'
    },
    items: [{ price: { product_id: 'prod_pro_tier' } }]
  }
};

const mockAdvancedSubscriptionPayload: WebhookPayload = {
  event_type: 'subscription_created',
  data: {
    customer: { email: 'test@example.com' },
    subscription: {
      id: 'sub_advanced_123',
      status: 'active'
    },
    items: [{ price: { product_id: 'prod_advanced_tier' } }]
  }
};

const mockSubscriptionCancelledPayload: WebhookPayload = {
  event_type: 'subscription_cancelled',
  data: {
    customer: { email: 'pro@example.com' },
    subscription: {
      id: 'sub_existing',
      status: 'cancelled'
    }
  }
};

const mockSubscriptionUpdatedPayload: WebhookPayload = {
  event_type: 'subscription_updated',
  data: {
    customer: { email: 'pro@example.com' },
    subscription: {
      id: 'sub_existing',
      status: 'past_due'
    },
    items: [{ price: { product_id: 'prod_pro_tier' } }]
  }
};

// --- Helper function to determine tier from product ID ---
const getTierFromProductId = (productId: string): 'pro' | 'advanced' => {
  const tierMapping: { [key: string]: 'pro' | 'advanced' } = {
    'prod_pro_tier': 'pro',
    'prod_pro_monthly': 'pro',
    'prod_pro_yearly': 'pro',
    'prod_advanced_tier': 'advanced',
    'prod_advanced_monthly': 'advanced',
    'prod_advanced_yearly': 'advanced'
  };
  
  return tierMapping[productId] || 'pro';
};

// --- Function to be Tested (based on our pseudocode) ---
const handleWebhook = (payload: WebhookPayload, db: UserDatabase): WebhookResult => {
  try {
    const userEmail = payload.data.customer.email;
    const user = Object.values(db).find(u => u.email === userEmail);

    if (!user) {
      return { 
        status: 'error', 
        message: 'User not found',
        action: 'user_lookup_failed'
      };
    }

    // Create a copy to avoid mutating the original
    const updatedUser = { ...user };

    switch (payload.event_type) {
      case 'subscription_created':
        if (payload.data.items && payload.data.items.length > 0) {
          const productId = payload.data.items[0].price.product_id;
          updatedUser.tier = getTierFromProductId(productId);
          updatedUser.subscriptionId = payload.data.subscription?.id;
          updatedUser.subscriptionStatus = 'active';
          updatedUser.subscriptionStartDate = payload.data.subscription?.started_at;
          updatedUser.subscriptionEndDate = payload.data.subscription?.next_billed_at;
          
          // Update the database
          db[user.id] = updatedUser;
          
          return { 
            status: 'success', 
            updatedUser,
            action: 'subscription_created',
            message: `User upgraded to ${updatedUser.tier} tier`
          };
        }
        break;

      case 'subscription_cancelled':
        updatedUser.tier = 'free';
        updatedUser.subscriptionStatus = 'cancelled';
        
        // Keep subscription ID for reference but mark as cancelled
        // Don't remove subscription data for audit purposes
        
        // Update the database
        db[user.id] = updatedUser;
        
        return { 
          status: 'success', 
          updatedUser,
          action: 'subscription_cancelled',
          message: 'User downgraded to free tier'
        };

      case 'subscription_updated':
        if (payload.data.subscription) {
          updatedUser.subscriptionStatus = payload.data.subscription.status as any;
          
          // If subscription is past due or cancelled, downgrade to free
          if (['past_due', 'cancelled', 'unpaid'].includes(payload.data.subscription.status)) {
            updatedUser.tier = 'free';
          } else if (payload.data.items && payload.data.items.length > 0) {
            // If subscription is active/trialing, ensure correct tier
            const productId = payload.data.items[0].price.product_id;
            updatedUser.tier = getTierFromProductId(productId);
          }
          
          // Update the database
          db[user.id] = updatedUser;
          
          return { 
            status: 'success', 
            updatedUser,
            action: 'subscription_updated',
            message: `Subscription status updated to ${payload.data.subscription.status}`
          };
        }
        break;

      case 'subscription_payment_succeeded':
        // Ensure user has correct tier and active status
        if (payload.data.items && payload.data.items.length > 0) {
          const productId = payload.data.items[0].price.product_id;
          updatedUser.tier = getTierFromProductId(productId);
          updatedUser.subscriptionStatus = 'active';
          
          // Update the database
          db[user.id] = updatedUser;
          
          return { 
            status: 'success', 
            updatedUser,
            action: 'payment_succeeded',
            message: 'Payment processed successfully'
          };
        }
        break;

      case 'subscription_payment_failed':
        // Mark subscription as past due but don't immediately downgrade
        updatedUser.subscriptionStatus = 'past_due';
        
        // Update the database
        db[user.id] = updatedUser;
        
        return { 
          status: 'success', 
          updatedUser,
          action: 'payment_failed',
          message: 'Payment failed, subscription marked as past due'
        };

      default:
        return { 
          status: 'error', 
          message: `Unhandled event type: ${payload.event_type}`,
          action: 'unsupported_event'
        };
    }

    return { 
      status: 'error', 
      message: 'Invalid payload structure',
      action: 'invalid_payload'
    };
  } catch (error) {
    return { 
      status: 'error', 
      message: `Webhook processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      action: 'processing_error'
    };
  }
};

// --- Advanced webhook validation ---
const validateWebhookSignature = (payload: string, signature: string, secret: string): boolean => {
  // Simplified signature validation (in real implementation, use crypto)
  const expectedSignature = `sha256=${Buffer.from(payload + secret).toString('base64')}`;
  return signature === expectedSignature;
};

const processWebhookWithValidation = (
  payloadString: string, 
  signature: string, 
  secret: string, 
  db: UserDatabase
): WebhookResult => {
  // Validate signature first
  if (!validateWebhookSignature(payloadString, signature, secret)) {
    return {
      status: 'error',
      message: 'Invalid webhook signature',
      action: 'signature_validation_failed'
    };
  }

  try {
    const payload: WebhookPayload = JSON.parse(payloadString);
    return handleWebhook(payload, db);
  } catch (error) {
    return {
      status: 'error',
      message: 'Invalid JSON payload',
      action: 'json_parse_error'
    };
  }
};

// --- Test Suite ---
describe('Payment Webhook Handler', () => {
  let testDb: UserDatabase;

  beforeEach(() => {
    // Create a fresh copy of the mock database for each test
    testDb = JSON.parse(JSON.stringify(mockUserDatabase));
  });

  describe('Subscription Creation', () => {
    it('should upgrade a user to "pro" tier on a "subscription_created" event', () => {
      const result = handleWebhook(mockSubscriptionCreatedPayload, testDb);

      expect(result.status).toBe('success');
      expect(result.updatedUser?.tier).toBe('pro');
      expect(result.updatedUser?.subscriptionId).toBe('sub_new_123');
      expect(result.updatedUser?.subscriptionStatus).toBe('active');
      expect(result.action).toBe('subscription_created');
    });

    it('should upgrade a user to "advanced" tier for advanced product', () => {
      const result = handleWebhook(mockAdvancedSubscriptionPayload, testDb);

      expect(result.status).toBe('success');
      expect(result.updatedUser?.tier).toBe('advanced');
      expect(result.updatedUser?.subscriptionId).toBe('sub_advanced_123');
      expect(result.action).toBe('subscription_created');
    });

    it('should handle subscription creation with date information', () => {
      const result = handleWebhook(mockSubscriptionCreatedPayload, testDb);

      expect(result.updatedUser?.subscriptionStartDate).toBe('2024-01-01T00:00:00Z');
      expect(result.updatedUser?.subscriptionEndDate).toBe('2024-02-01T00:00:00Z');
    });
  });

  describe('Subscription Cancellation', () => {
    it('should downgrade a user on a "subscription_cancelled" event', () => {
      const result = handleWebhook(mockSubscriptionCancelledPayload, testDb);

      expect(result.status).toBe('success');
      expect(result.updatedUser?.tier).toBe('free');
      expect(result.updatedUser?.subscriptionStatus).toBe('cancelled');
      expect(result.action).toBe('subscription_cancelled');
    });

    it('should preserve subscription ID for audit purposes after cancellation', () => {
      const result = handleWebhook(mockSubscriptionCancelledPayload, testDb);

      expect(result.updatedUser?.subscriptionId).toBe('sub_existing');
      expect(result.updatedUser?.subscriptionStatus).toBe('cancelled');
    });
  });

  describe('Subscription Updates', () => {
    it('should handle subscription status updates', () => {
      const result = handleWebhook(mockSubscriptionUpdatedPayload, testDb);

      expect(result.status).toBe('success');
      expect(result.updatedUser?.subscriptionStatus).toBe('past_due');
      expect(result.updatedUser?.tier).toBe('free'); // Should downgrade on past_due
      expect(result.action).toBe('subscription_updated');
    });

    it('should maintain tier for active subscription updates', () => {
      const activeUpdatePayload = {
        ...mockSubscriptionUpdatedPayload,
        data: {
          ...mockSubscriptionUpdatedPayload.data,
          subscription: {
            id: 'sub_existing',
            status: 'active'
          }
        }
      };

      const result = handleWebhook(activeUpdatePayload, testDb);

      expect(result.updatedUser?.tier).toBe('pro');
      expect(result.updatedUser?.subscriptionStatus).toBe('active');
    });
  });

  describe('Payment Events', () => {
    it('should handle successful payment events', () => {
      const paymentSuccessPayload: WebhookPayload = {
        event_type: 'subscription_payment_succeeded',
        data: {
          customer: { email: 'test@example.com' },
          items: [{ price: { product_id: 'prod_pro_tier' } }]
        }
      };

      const result = handleWebhook(paymentSuccessPayload, testDb);

      expect(result.status).toBe('success');
      expect(result.updatedUser?.tier).toBe('pro');
      expect(result.updatedUser?.subscriptionStatus).toBe('active');
      expect(result.action).toBe('payment_succeeded');
    });

    it('should handle failed payment events', () => {
      const paymentFailedPayload: WebhookPayload = {
        event_type: 'subscription_payment_failed',
        data: {
          customer: { email: 'pro@example.com' }
        }
      };

      const result = handleWebhook(paymentFailedPayload, testDb);

      expect(result.status).toBe('success');
      expect(result.updatedUser?.subscriptionStatus).toBe('past_due');
      expect(result.action).toBe('payment_failed');
    });
  });

  describe('Error Handling', () => {
    it('should return an error if the user is not found', () => {
      const payloadWithUnknownUser = {
        ...mockSubscriptionCreatedPayload,
        data: { 
          ...mockSubscriptionCreatedPayload.data,
          customer: { email: 'unknown@example.com' } 
        }
      };
      
      const result = handleWebhook(payloadWithUnknownUser, testDb);

      expect(result.status).toBe('error');
      expect(result.message).toBe('User not found');
      expect(result.action).toBe('user_lookup_failed');
    });

    it('should handle unsupported event types', () => {
      const unsupportedPayload: WebhookPayload = {
        event_type: 'unsupported_event',
        data: {
          customer: { email: 'test@example.com' }
        }
      };

      const result = handleWebhook(unsupportedPayload, testDb);

      expect(result.status).toBe('error');
      expect(result.message).toBe('Unhandled event type: unsupported_event');
      expect(result.action).toBe('unsupported_event');
    });

    it('should handle malformed payloads gracefully', () => {
      const malformedPayload = {
        event_type: 'subscription_created',
        data: {
          customer: { email: 'test@example.com' }
          // Missing items array
        }
      } as WebhookPayload;

      const result = handleWebhook(malformedPayload, testDb);

      expect(result.status).toBe('error');
      expect(result.action).toBe('invalid_payload');
    });

    it('should handle exceptions during processing', () => {
      // Create a payload that will cause an error
      const errorPayload = {
        event_type: 'subscription_created',
        data: null as any
      };

      const result = handleWebhook(errorPayload, testDb);

      expect(result.status).toBe('error');
      expect(result.action).toBe('processing_error');
      expect(result.message).toContain('Webhook processing failed');
    });
  });

  describe('Database Updates', () => {
    it('should actually update the database when processing webhooks', () => {
      const originalUser = testDb['user-123'];
      expect(originalUser.tier).toBe('free');

      handleWebhook(mockSubscriptionCreatedPayload, testDb);

      const updatedUser = testDb['user-123'];
      expect(updatedUser.tier).toBe('pro');
      expect(updatedUser.subscriptionId).toBe('sub_new_123');
    });

    it('should not modify database on error conditions', () => {
      const originalDb = JSON.parse(JSON.stringify(testDb));
      
      const invalidPayload = {
        ...mockSubscriptionCreatedPayload,
        data: { customer: { email: 'nonexistent@example.com' } }
      };

      handleWebhook(invalidPayload, testDb);

      expect(testDb).toEqual(originalDb);
    });
  });

  describe('Webhook Signature Validation', () => {
    const testPayload = JSON.stringify(mockSubscriptionCreatedPayload);
    const testSecret = 'webhook_secret_key';
    const validSignature = `sha256=${Buffer.from(testPayload + testSecret).toString('base64')}`;

    it('should validate correct webhook signatures', () => {
      const result = processWebhookWithValidation(testPayload, validSignature, testSecret, testDb);
      expect(result.status).toBe('success');
    });

    it('should reject invalid webhook signatures', () => {
      const invalidSignature = 'sha256=invalid_signature';
      const result = processWebhookWithValidation(testPayload, invalidSignature, testSecret, testDb);
      
      expect(result.status).toBe('error');
      expect(result.message).toBe('Invalid webhook signature');
      expect(result.action).toBe('signature_validation_failed');
    });

    it('should handle invalid JSON in webhook payload', () => {
      const invalidJson = '{ invalid json }';
      const invalidSignature = `sha256=${Buffer.from(invalidJson + testSecret).toString('base64')}`;
      const result = processWebhookWithValidation(invalidJson, invalidSignature, testSecret, testDb);
      
      expect(result.status).toBe('error');
      expect(result.action).toBe('json_parse_error');
    });
  });

  describe('Product ID Mapping', () => {
    it('should correctly map product IDs to tiers', () => {
      expect(getTierFromProductId('prod_pro_tier')).toBe('pro');
      expect(getTierFromProductId('prod_pro_monthly')).toBe('pro');
      expect(getTierFromProductId('prod_advanced_tier')).toBe('advanced');
      expect(getTierFromProductId('prod_unknown')).toBe('pro'); // Default fallback
    });
  });
});

