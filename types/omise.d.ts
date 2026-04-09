// Minimal Omise type declarations (no @types/omise on npm)
declare module 'omise' {
  interface OmiseConfig {
    secretKey: string;
    publicKey?: string;
    omiseVersion?: string;
  }

  interface Card {
    number: string;
    name: string;
    expiration_month: number;
    expiration_year: number;
    security_code: string;
  }

  interface Token {
    id: string;
    object: 'token';
    used: boolean;
    card: {
      id: string;
      name: string;
      last_digits: string;
      brand: string;
      expiration_month: number;
      expiration_year: number;
    };
  }

  interface Charge {
    id: string;
    object: 'charge';
    amount: number;
    currency: string;
    status: 'successful' | 'failed' | 'pending' | 'expired' | 'reversed';
    paid: boolean;
    failure_code?: string;
    failure_message?: string;
    card?: Token['card'];
  }

  interface ChargeCreateParams {
    amount: number;
    currency: string;
    card?: string;
    description?: string;
    capture?: boolean;
    metadata?: Record<string, string | number | boolean>;
  }

  interface OmiseClient {
    charges: {
      create(params: ChargeCreateParams): Promise<Charge>;
      retrieve(id: string): Promise<Charge>;
    };
    tokens: {
      retrieve(id: string): Promise<Token>;
    };
  }

  function omise(config: OmiseConfig): OmiseClient;
  export = omise;
}
