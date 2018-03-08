package holidayinn.app.resource;

import holidayinn.app.resource.RouteUtils;
import java.sql.SQLException;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import holidayinn.app.restApiDatabaseConnection.RestApiDatabaseConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import javax.ws.rs.FormParam;
import org.json.JSONObject;

@Path("register")
public class RegisterRoute {
    @POST
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    public String register(
            @Context HttpHeaders hh,
            @FormParam("firstName") String firstName,
            @FormParam("lastName") String lastName,
            @FormParam("role") String role
            ) throws SQLException {
        String base64String = RouteUtils.getBase64StringFromRequestHeader(hh);
        JSONObject user = RouteUtils.getUserEmailAndPassword(base64String);
        String email = user.getString("email");
        String password = user.getString("password");
        if (!RouteUtils._isRegistered(email)) {
            boolean hasAddedSuccessfully = _registerUser(email, password, role, firstName, lastName);
            if (hasAddedSuccessfully) {
                return "true";
            }
        }
        return "false";
    }
    
    private boolean _registerUser(
            String email,
            String password,
            String role,
            String firstName,
            String lastName) throws SQLException {
        
        Connection connection = null;
        PreparedStatement sqlStatement = null;
        String query = "INSERT INTO EMPLOYEE (email, password, role, firstname, lastname) " +
                        "VALUES (?, ?, ?, ?, ?)";
        

        try {
            connection = RestApiDatabaseConnection.HotelAppConnect().getConnection();
            sqlStatement = connection.prepareStatement(query);
            sqlStatement.setString(1, email);
            sqlStatement.setString(2, password);
            sqlStatement.setString(3, role);
            sqlStatement.setString(4, firstName);
            sqlStatement.setString(5, lastName);
            int hasAddedSuccessfully = sqlStatement.executeUpdate();
            while (hasAddedSuccessfully > 0) {
                return true;
            }
        } catch (Exception e) {
            // TODO: send a response with error to the front end

        }

        finally {
            if (sqlStatement != null) {
                sqlStatement.close();
                connection.close();
            }
        }
        
        return false;
    }
}
