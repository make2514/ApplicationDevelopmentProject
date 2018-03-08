/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package holidayinn.app.resource;

import holidayinn.app.restApiDatabaseConnection.RestApiDatabaseConnection;
import java.math.BigDecimal;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.*;
import java.sql.*;
import java.util.StringTokenizer;
import javax.jms.Message;
import javax.ws.rs.Consumes;
import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.PathParam;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 *
 * @author Toan Nguyen
 */
@Path("secured")
public class SecuredRoutes {
    private static final String AUTHORIZATION_HEADER_PREFIX = "Basic ";
    
    @GET
    @Path("message")
    @Produces(MediaType.TEXT_PLAIN)
    public String securedMethod() {
        return "This api is secured";
    }
    
    @GET
    @Path("login")
    @Produces(MediaType.TEXT_PLAIN)
    public String login() throws SQLException {
        return "User is authenticated and can log in";
    }
    
    // Get all teams that the user belongs to
    @GET
    @Path("team")
    @Produces(MediaType.APPLICATION_JSON)
    public String getTeams(@Context HttpHeaders hh) throws SQLException {
        MultivaluedMap<String, String> headerParams = hh.getRequestHeaders();
        return getTeamsFromDb(headerParams.getFirst("Authorization"));
    }
    
    
    @GET
    @Path("team/{teamId}")
    @Produces(MediaType.APPLICATION_JSON)
    public String getTeamMembers(@PathParam("teamId") String name) throws SQLException {
        return getTeamMembersFromDb(name).toString();
    }
    
    @GET
    @Path("team/{teamId}/{employeeId}")
    @Produces(MediaType.TEXT_PLAIN)
    public String getTeamMemberTasks(
            @PathParam("employeeId") String employeeId,
            @PathParam("teamId") String teamId) throws SQLException {
        JSONArray tasks = getTasksOfAPersonInATeamFromDb(Integer.parseInt(employeeId), teamId);
        return tasks.toString();
    }
    
    @GET
    @Path("user")
    @Produces(MediaType.TEXT_PLAIN)
    public String getCurrentUserInfo(@Context HttpHeaders hh) throws SQLException {
        String base64String = getBase64StringFromRequestHeader(hh);
        String email = getEmailFromBase64String(base64String);
        return getUserInfoFromDb(email).toString();
    }
    
    @POST
    @Path("team")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    public String addNewTeam(
            @FormParam("teamName") String teamName,
            @FormParam("userId") String userId) throws SQLException {
        return addNewTeamToDb(teamName, userId);
    }
    
    @POST
    @Path("team/member")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    public String addMember(
            @FormParam("teamId") String teamId,
            @FormParam("userEmail") String userEmail) throws SQLException {
        return addMemberToDb(teamId, userEmail);
    }
    
    @POST
    @Path("team/member/task")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    public String addTask(
            @FormParam("teamId") String teamId,
            @FormParam("employeeId") String employeeId,
            @FormParam("description") String description) throws SQLException {
        return addTaskToDb(teamId, employeeId, description);
    }
    
    private String getEmailFromBase64String(String base64String) {
        String authToken = base64String;
        authToken = authToken.replaceFirst(AUTHORIZATION_HEADER_PREFIX, "");
        String decodedAuthString = new String(java.util.Base64.getDecoder().decode(authToken));
        StringTokenizer tokenizer = new StringTokenizer(decodedAuthString, ":");
        return tokenizer.nextToken();
    }
    
    private String getBase64StringFromRequestHeader(HttpHeaders hh) {
        MultivaluedMap<String, String> headerParams = hh.getRequestHeaders();
        return headerParams.getFirst("Authorization");
    } 
    
    // Refactor this method to a method that returns an SQL ResultSet
    // which receives an SQL String as a param
    private String getTeamsFromDb(String base64String) throws SQLException {
        
        Connection connection = null;
        Statement sqlStatement = null;
        String email = getEmailFromBase64String(base64String);
        String query = "SELECT TEAM.NAME, TEAM.ID\n" +
                        "FROM EMPLOYEE_TEAM\n" +
                        "JOIN EMPLOYEE on EMPLOYEE.id = EMPLOYEE_TEAM.EMPLOYEEID\n" +
                        "JOIN TEAM ON TEAM.id = EMPLOYEE_TEAM.teamid " + 
                        "where EMPLOYEE.EMAIL = '" + email + "'";

        try {
            connection = RestApiDatabaseConnection.HotelAppConnect().getConnection();
            sqlStatement = connection.createStatement();
            ResultSet resultSet = sqlStatement.executeQuery(query);
            System.out.println(resultSet);
            JSONArray teamList = new JSONArray();
            while (resultSet.next()) {
                JSONObject team = new JSONObject();
                // TODO: current assumption is that emails in our database are unique
                // To make sure that the emails are unique, we will need to implement a checking mechanism
                // when user registers
                team.put("id", resultSet.getString("ID"));
                team.put("name", resultSet.getString("NAME"));
                teamList.put(team);
            }
            return teamList.toString();
        } catch (Exception e) {
            // TODO: send a response with error to the front end

        }

        finally {
            if (sqlStatement != null) {
                sqlStatement.close();
                connection.close();
            }
        }
        
        return "";
    }
    
    private JSONArray getTeamMembersFromDb(String teamId) throws SQLException {
        
        Connection connection = null;
        Statement sqlStatement = null;
        String query = "SELECT EMPLOYEE.FIRSTNAME, EMPLOYEE.LASTNAME, EMPLOYEE.ID\n" +
                        "FROM EMPLOYEE\n" +
                        "JOIN EMPLOYEE_TEAM on EMPLOYEE.id = EMPLOYEE_TEAM.EMPLOYEEID\n" +
                        "JOIN TEAM ON TEAM.id = EMPLOYEE_TEAM.teamid where TEAM.id = " + teamId;

        try {
            connection = RestApiDatabaseConnection.HotelAppConnect().getConnection();
            sqlStatement = connection.createStatement();
            ResultSet resultSet = sqlStatement.executeQuery(query);
            JSONArray ja = new JSONArray();
            while (resultSet.next()) {
                JSONObject obj = new JSONObject();  
                obj.put("firstName", resultSet.getString("FIRSTNAME"));
                obj.put("lastName", resultSet.getString("LASTNAME"));
                obj.put("ID", resultSet.getString("ID"));
                ja.put(obj);
            }
            return ja;
        } catch (Exception e) {
            // TODO: send a response with error to the front end

        }

        finally {
            if (sqlStatement != null) {
                sqlStatement.close();
                connection.close();
            }
        }
        
        return null;
    }
    
    private JSONObject getUserInfoFromDb(String email) throws SQLException {
        
        Connection connection = null;
        Statement sqlStatement = null;
        String query = "SELECT * FROM EMPLOYEE WHERE EMAIL = '" + email + "'";

        try {
            connection = RestApiDatabaseConnection.HotelAppConnect().getConnection();
            sqlStatement = connection.createStatement();
            ResultSet resultSet = sqlStatement.executeQuery(query);
            JSONObject obj = new JSONObject();  
            while (resultSet.next()) {
                obj.put("firstName", resultSet.getString("FIRSTNAME"));
                obj.put("lastName", resultSet.getString("LASTNAME"));
                obj.put("ID", resultSet.getString("ID"));
                obj.put("role", resultSet.getString("ROLE"));
            }
            return obj;
        } catch (Exception e) {
            // TODO: send a response with error to the front end

        }

        finally {
            if (sqlStatement != null) {
                sqlStatement.close();
                connection.close();
            }
        }
        
        return null;
    }
 
    private JSONArray getTasksOfAPersonInATeamFromDb(Integer memberId, String teamId) throws SQLException {
        Connection connection = null;
        Statement sqlStatement = null;
        
        String query = "SELECT DESCRIPTION,STATUS FROM TASK WHERE EMPLOYEEID = " + memberId +
                " AND TEAMID = " + teamId;

        try {
            connection = RestApiDatabaseConnection.HotelAppConnect().getConnection();
            sqlStatement = connection.createStatement();
            ResultSet resultSet = sqlStatement.executeQuery(query);
            JSONArray ja = new JSONArray();
            while (resultSet.next()) {
                JSONObject obj = new JSONObject();  
                obj.put("description", resultSet.getString("DESCRIPTION"));
                obj.put("status", resultSet.getString("STATUS"));
                ja.put(obj);
            }
            return ja;
        } catch (Exception e) {
            // TODO: send a response with error to the front end

        }

        finally {
            if (sqlStatement != null) {
                sqlStatement.close();
                connection.close();
            }
        }
        return null;
    }
    
    private String addNewTeamToDb(String teamName, String employeeId) throws SQLException {
        Connection connection = null;
        Statement sqlStatement = null;
        
        String query = "INSERT INTO TEAM (NAME) " + "VALUES " + "(" + "'" + teamName + "'" + ")";
        String error = "";
        try {
            connection = RestApiDatabaseConnection.HotelAppConnect().getConnection();
            sqlStatement = connection.createStatement();
            int hasAddedSuccessfully = sqlStatement.executeUpdate(query, Statement.RETURN_GENERATED_KEYS);
            ResultSet rs = sqlStatement.getGeneratedKeys();
            if (rs.next()) {
                if (hasAddedSuccessfully > 0) {
                    String newTeamId = rs.getBigDecimal(1).toString();
                    if (addUserToEmployeeTeamDb(sqlStatement, employeeId, newTeamId) > 0) {
                        return newTeamId;
                    }
                }
            }
        } catch (Exception e) {
            // TODO: send a response with error to the front end
            error = e.toString();

        }

        finally {
            if (sqlStatement != null) {
                sqlStatement.close();
                connection.close();
            }
        }
        return "false" + error + " " + query;
    }
   
    private int addUserToEmployeeTeamDb(
        Statement sqlStatement,
        String employeeId, String teamId) throws SQLException {
        String addUserToTeamQuery = "INSERT INTO EMPLOYEE_TEAM (EMPLOYEEID, TEAMID) VALUES ";
        addUserToTeamQuery += "(" + employeeId + "," + teamId + ")";
        int hasAddedSuccesfully = sqlStatement.executeUpdate(addUserToTeamQuery, Statement.RETURN_GENERATED_KEYS);
        if (hasAddedSuccesfully > 0) {
            return 1;
        }
        return 0;
    }
    
     private String addMemberToDb(String teamId, String userEmail) throws SQLException {
        /*
         1. Check if the email is registered or not
         2. If yes, check if the email belongs to a user who is already a team member
                If yes, return string indicating so
                If no, add the user to the team
         3. If no, return string indicating so
         */
        String userBelongToTeamQuery = "SELECT TEAM.NAME, TEAM.ID \n" +
                        "FROM EMPLOYEE_TEAM\n" +
                        "JOIN EMPLOYEE on EMPLOYEE.id = EMPLOYEE_TEAM.EMPLOYEEID\n" +
                        "JOIN TEAM ON TEAM.id = EMPLOYEE_TEAM.teamid\n" +
                        "where EMPLOYEE.EMAIL = ?\n" +
                        "AND TEAM.ID = ?";
        String insertUserToTeamQuery = "INSERT INTO EMPLOYEE_TEAM (EMPLOYEEID, TEAMID) "
                                        + "VALUES (?, ?)";
         boolean isRegistered = RouteUtils._isRegistered(userEmail);
         boolean  isUserBelongToTeam = RouteUtils.isInDb(
                 userBelongToTeamQuery,
                 new String[]{userEmail, teamId}
         );
         if (isRegistered && !isUserBelongToTeam) {
             RouteUtils.insertToDb(
                     insertUserToTeamQuery,
                     new String[]{getUserInfoFromDb(userEmail).getString("ID"), teamId});
             return "true";
         }
         
         return "false";
    }
     
     private String addTaskToDb(
             String teamId,
             String employeeId,
             String description) throws SQLException {
        /*
         1. Check if the email is registered or not
         2. If yes, check if the email belongs to a user who is already a team member
                If yes, return string indicating so
                If no, add the user to the team
         3. If no, return string indicating so
         */
        String addTaskQuery = "INSERT INTO TASK (EMPLOYEEID, TEAMID, DESCRIPTION, STATUS)\n" +
                                "VALUES (?, ?, ?, 0)";
        String addedSuccessfully = RouteUtils.insertToDb(
                addTaskQuery,
                new String[]{employeeId, teamId, description});
        
        return addedSuccessfully;
    }
}
