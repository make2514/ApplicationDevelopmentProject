/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package holidayinn.app.resource;

import holidayinn.app.restApiDatabaseConnection.RestApiDatabaseConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Base64;
import java.util.StringTokenizer;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MultivaluedMap;
import org.json.JSONObject;

/**
 *
 * @author Toan Nguyen
 */
public final class RouteUtils {
    private static final String AUTHORIZATION_HEADER_PREFIX = "Basic ";
    
    public static String getEmailFromBase64String(String base64String) {
        String authToken = base64String;
        authToken = authToken.replaceFirst(AUTHORIZATION_HEADER_PREFIX, "");
        String decodedAuthString = new String(java.util.Base64.getDecoder().decode(authToken));
        StringTokenizer tokenizer = new StringTokenizer(decodedAuthString, ":");
        return tokenizer.nextToken();
    }
    
    public static String getBase64StringFromRequestHeader(HttpHeaders hh) {
        MultivaluedMap<String, String> headerParams = hh.getRequestHeaders();
        String base64String = headerParams.getFirst("Authorization").replaceFirst(AUTHORIZATION_HEADER_PREFIX, "");
        return base64String;
    }
    
    public static JSONObject getUserEmailAndPassword(String base64String) {
        String decodedAuthString = new String(Base64.getDecoder().decode(base64String));
        StringTokenizer tokenizer = new StringTokenizer(decodedAuthString, ":");
        String email = tokenizer.nextToken();
        String password = tokenizer.nextToken();
        JSONObject userObj = new JSONObject();
        userObj.put("email", email);
        userObj.put("password", password);
        return userObj;
    }
    
    public static boolean _isRegistered(String email) throws SQLException {
        
        Connection connection = null;
        Statement sqlStatement = null;
        String query = "SELECT * FROM EMPLOYEE WHERE EMAIL = '" + email + "'";
        boolean isRegistered = true;
        try {
            connection = RestApiDatabaseConnection.HotelAppConnect().getConnection();
            sqlStatement = connection.createStatement();
            ResultSet resultSet = sqlStatement.executeQuery(query);
            isRegistered = resultSet.next();
        } catch (Exception e) {
            // TODO: send a response with error to the front end

        }

        finally {
            if (sqlStatement != null) {
                sqlStatement.close();
                connection.close();
            }    
        }
        
        return isRegistered;
    }
    
    public static boolean isInDb(String query,String[] params) throws SQLException {
        
        Connection connection = null;
        PreparedStatement sqlStatement = null;
        boolean result = false;
        try {
            connection = RestApiDatabaseConnection.HotelAppConnect().getConnection();
            sqlStatement = connection.prepareStatement(query);
            for (int i = 0; i < params.length; i++) {
                sqlStatement.setString(i + 1, params[i]);
            }
            ResultSet resultSet = sqlStatement.executeQuery();
            result = resultSet.next();
        } catch (Exception e) {
            // TODO: send a response with error to the front end
        }

        finally {
            if (sqlStatement != null) {
                sqlStatement.close();
                connection.close();
            }    
        }
        
        return result;
    }
    
    public static String insertToDb(String query,String[] params) throws SQLException {
        
        Connection connection = null;
        PreparedStatement sqlStatement = null;

        try {
            connection = RestApiDatabaseConnection.HotelAppConnect().getConnection();
            sqlStatement = connection.prepareStatement(query);
            for (int i = 0; i < params.length; i++) {
                sqlStatement.setString(i + 1, params[i]);
            }
            int hasAddedSuccessfully = sqlStatement.executeUpdate();
            while (hasAddedSuccessfully > 0) {
                return "true";
            }
        } catch (Exception e) {
            // TODO: send a response with error to the front end
            return e.toString();

        }

        finally {
            if (sqlStatement != null) {
                sqlStatement.close();
                connection.close();
            }
        }
        
        return "false";
    }
}
