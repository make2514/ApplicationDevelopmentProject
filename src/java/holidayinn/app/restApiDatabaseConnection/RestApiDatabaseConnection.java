/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package holidayinn.app.restApiDatabaseConnection;

import javax.naming.*;
import javax.sql.*;

/**
 *
 * @author Toan Nguyen
 */
public class RestApiDatabaseConnection {
    // Using static variable to prevent redundant initilization of DataSource
    private static DataSource HotelAppDataSource = null;
    private static Context context = null;
    
    public static DataSource HotelAppConnect() throws Exception {
        if (HotelAppDataSource != null) {
            return HotelAppDataSource;
        }
        
        try {
            if (context == null) {
                // To use JNDI, we must first create an InitialContextobject.
                // InitialContext is from javax.naming package
                context = new InitialContext();
            }
            HotelAppDataSource = (DataSource) context.lookup("HotelAppJNDI");
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return HotelAppDataSource;
    }
    
}
