import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;
      
      if (!token) return false;
      
      const customToken = token as typeof token & { roles?: string[], realm_access?: { roles: string[] } };
      const roles = customToken.roles || customToken.realm_access?.roles || [];
      const hasRole = (r: string) => roles.includes(r) || roles.includes(r.toLowerCase());
      
      if (path.startsWith('/admin')) {
        return hasRole('ADMIN');
      }
      
      if (path.startsWith('/employee')) {
        return hasRole('ADMIN') || hasRole('EMPLOYEE');
      }
      
      return true;
    },
  },
});

export const config = { 
  matcher: [
    "/dashboard/:path*", 
    "/admin/:path*", 
    "/accounts/:path*", 
    "/transactions/:path*", 
    "/loans/:path*", 
    "/employee/:path*"
  ] 
};
