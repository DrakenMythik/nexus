/**
 * CI runs `npm run build` then `cypress run`; webServer serves the production bundle via
 * `vite preview` with placeholder VITE_* env from `.github/workflows/main-protection.yml`.
 * Locally: build first, or rely on webServer; `.env.local` works for `npm run dev` too.
 *
 * The auth token request is stubbed so the UI shows a deterministic invalid-credentials message.
 */
describe('Email auth on login', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/auth/v1/token**', {
      statusCode: 400,
      body: {
        error: 'invalid_grant',
        error_description: 'Invalid login credentials'
      }
    }).as('token');
  });

  it('submits the email form and shows auth feedback', () => {
    cy.visit('/login');
    cy.contains('h1', 'Sign in').should('be.visible');
    cy.get('input[name="email"]').type('e2e@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.wait('@token');
    cy.get('[data-slot="alert"][role="alert"]', { timeout: 5000 })
      .should('be.visible')
      .and('contain.text', 'Invalid email or password');
  });
});
