/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package holidayinn.app.resource;

import holidayinn.app.restApiDatabaseConnection.RestApiDatabaseConnection;
import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.StringTokenizer;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.Provider;
import java.util.Base64;

/**
 *
 * @author Toan Nguyen
 */
@Provider // Filter has to be annotated with @Provider
public class SecurityFilter implements ContainerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String AUTHORIZATION_HEADER_PREFIX = "Basic ";
    private static final String SECURED_URL_PREFIX = "secured";

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        if (requestContext.getUriInfo().getPath().contains(SECURED_URL_PREFIX)) {
            try {
                if (checkCredentialString(requestContext)) {
                    return;
                }
            } catch (SQLException ex) {
                Logger.getLogger(SecurityFilter.class.getName()).log(Level.SEVERE, null, ex);
            }
            Response unauthorizedStatus = Response
                .status(Response.Status.UNAUTHORIZED)
                .entity("User is not authenticated")
                .build();
            requestContext.abortWith(unauthorizedStatus);
        }
    }

    private boolean checkCredentialString(ContainerRequestContext requestContext) throws SQLException {

        Connection connection = null;
        Statement sqlStatement = null;
        String query;

        List < String > authHeader = requestContext.getHeaders().get(AUTHORIZATION_HEADER);
        if (authHeader != null && authHeader.size() > 0) {
            String authToken = authHeader.get(0);

            // Refactor this using getEmailFromBase64String From SecuredRoutes.java
            authToken = authToken.replaceFirst(AUTHORIZATION_HEADER_PREFIX, "");
            String decodedAuthString = new String(Base64.getDecoder().decode(authToken));
            StringTokenizer tokenizer = new StringTokenizer(decodedAuthString, ":");
            String email = tokenizer.nextToken();
            String password = tokenizer.nextToken();
            String resultPassword;
            query = "SELECT * FROM EMPLOYEE WHERE EMAIL = '" + email + "'";

            try {
                connection = RestApiDatabaseConnection.HotelAppConnect().getConnection();
                sqlStatement = connection.createStatement();
                ResultSet resultSet = sqlStatement.executeQuery(query);
                System.out.println(resultSet);
                while (resultSet.next()) {
                    // TODO: current assumption is that emails in our database are unique
                    // To make sure that the emails are unique, we will need to implement a checking mechanism
                    // when user registers
                    resultPassword = resultSet.getString("PASSWORD");
                    return resultPassword.equals(password);
                }
            } catch (Exception e) {
                // TODO: send a response with error to the front end

            } finally {
                if (sqlStatement != null) {
                    sqlStatement.close();
                    connection.close();
                }
            }
        }
        return false;
    }

}