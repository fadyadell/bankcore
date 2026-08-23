describe("Customer Login", () => {
  it("should successfully log in as a customer", () => {
    cy.visit("/login");
    
    // Assuming Keycloak or custom login form
    cy.get('input[name="username"]').type("customer1");
    cy.get('input[name="password"]').type("password");
    cy.get('button[type="submit"]').click();

    // Verify redirection to dashboard
    cy.url().should("include", "/dashboard");
    cy.contains("Welcome, customer1").should("be.visible");
    cy.contains("Account Balance").should("be.visible");
  });
});
