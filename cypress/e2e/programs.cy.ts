const testUserId = 'e2e00000-0000-0000-0000-000000000001';

const testUser = {
  id: testUserId,
  email: 'e2e@example.com',
  display_name: 'E2E User',
  birthdate: '1990-01-01',
  sex: 'male',
};

const testPrograms = [
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    name: 'Starting Strength',
    description: 'A novice linear progression program focused on the core barbell lifts.',
    level: 'Beginner',
    specialty: 'Strength',
    days_per_week: 3,
    weeks_duration: 12,
  },
  {
    id: 'a1000000-0000-0000-0000-000000000002',
    name: '3 Day Push PPL',
    description: 'A 3-day split designed to build muscle.',
    level: 'Intermediate',
    specialty: 'Hypertrophy',
    days_per_week: 3,
    weeks_duration: 12,
  },
];

function supabaseSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  return JSON.stringify({
    access_token: 'e2e-access-token',
    refresh_token: 'e2e-refresh-token',
    expires_at: expiresAt,
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: testUserId,
      email: testUser.email,
      aud: 'authenticated',
      role: 'authenticated',
    },
  });
}

function stubAuthenticatedApp() {
  cy.intercept('GET', '**/auth/v1/user**', {
    statusCode: 200,
    body: { user: { id: testUserId, email: testUser.email } },
  }).as('authUser');

  cy.intercept('GET', '**/rest/v1/users**', {
    statusCode: 200,
    body: [testUser],
  }).as('appUser');

  cy.intercept('GET', '**/rest/v1/daily_biometrics**', {
    statusCode: 200,
    body: [
      {
        id: 'bio-1',
        user_id: testUserId,
        log_date: new Date().toISOString().slice(0, 10),
        readiness_score: 7,
      },
    ],
  }).as('dailyBiometrics');

  cy.intercept('GET', '**/rest/v1/programs**', {
    statusCode: 200,
    body: testPrograms,
  }).as('programs');

  cy.intercept('GET', '**/rest/v1/user_program_enrollments**', {
    statusCode: 200,
    body: [],
  }).as('enrollment');

  cy.intercept('GET', '**/rest/v1/workout_logs**', {
    statusCode: 200,
    body: [],
  }).as('workoutLogs');

  cy.intercept('GET', '**/rest/v1/adherence_events**', {
    statusCode: 200,
    body: [],
  }).as('adherenceEvents');
}

describe('Program library navigation', () => {
  beforeEach(() => {
    stubAuthenticatedApp();
  });

  it('navigates from the dashboard program card to the library', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('sb-127-auth-token', supabaseSession());
      },
    });

    cy.contains('h1', 'Today in Nexus', { timeout: 10000 }).should('be.visible');
    cy.contains('button', 'Browse programs').click();
    cy.url().should('include', '/programs');
    cy.contains('h1', 'Program library').should('be.visible');
    cy.contains('Starting Strength').should('be.visible');
    cy.contains('3 Day Push PPL').should('be.visible');
  });
});
