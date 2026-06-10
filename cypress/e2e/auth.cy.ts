/**
 * CI runs `npm run build` then `npm run test:e2e:ci`; both E2E scripts start the production
 * bundle via `preview:e2e` (start-server-and-test + vite preview on 127.0.0.1:4173).
 * Locally: build first, then `npm run test:e2e` for interactive Cypress with the same auto-start.
 * `.env.local` works for `npm run dev` too.
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
