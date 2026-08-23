describe("Loan Flow", () => {
  beforeEach(() => {
    // Authenticate as a customer before each test
    cy.visit("/login");
    cy.get('input[name="username"]').type("customer1");
    cy.get('input[name="password"]').type("password");
    cy.get('button[type="submit"]').click();
  });

  it("should allow a customer to apply for a loan", () => {
    cy.visit("/loans/new");
    cy.get('input[name="amount"]').type("50000");
    cy.get('input[name="term"]').type("24");
    cy.get('button[type="submit"]').click();

    cy.contains("Loan application submitted").should("be.visible");
    
    // Verify it appears in the list of loans as PENDING
    cy.visit("/dashboard");
    cy.contains("$50,000.00").should("be.visible");
    cy.contains("PENDING").should("be.visible");
  });
});
