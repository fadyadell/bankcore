describe("Transaction Flow", () => {
  beforeEach(() => {
    // Authenticate as a customer before each test
    cy.visit("/login");
    cy.get('input[name="username"]').type("customer1");
    cy.get('input[name="password"]').type("password");
    cy.get('button[type="submit"]').click();
  });

  it("should allow a customer to create a transfer transaction", () => {
    cy.visit("/transactions/new");
    cy.get('input[name="toAccountId"]').type("ACCT-002");
    cy.get('input[name="amount"]').type("500");
    cy.get('input[name="description"]').type("Test Transfer");
    cy.get('button[type="submit"]').click();

    cy.contains("Transaction submitted").should("be.visible");
    
    // Verify it appears in the transaction history
    cy.visit("/dashboard");
    cy.contains("Test Transfer").should("be.visible");
    cy.contains("-$500.00").should("be.visible");
  });
});
