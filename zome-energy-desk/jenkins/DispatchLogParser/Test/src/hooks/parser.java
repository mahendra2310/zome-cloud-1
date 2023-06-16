package hooks;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

public class parser {
    public void parse() {
        String inputFile = "/var/lib/jenkins/workspace/DispatchLogParser/filetotransfer/log/app.log.1";
        String outputFile = "/var/lib/jenkins/workspace/DispatchLogParser/table.txt";
        String line;
        String deviceId = "";
        String requestId = "";
        String setTempCommand = "";
        String displayUnitCommand = "";
        String setpointCommand = "";
        String getModeCommand = "";

        try (BufferedReader br = new BufferedReader(new FileReader(inputFile));
             BufferedWriter bw = new BufferedWriter(new FileWriter(outputFile))) {
            bw.write("DeviceIDs                             GET MODE                        Set Temp                    Display Unit");
            bw.newLine();
            bw.newLine();
            while ((line = br.readLine()) != null) {
                if (line.contains("\"commandType\":\"5005\"")) {
                    // Extract device ID and request ID from line
                    deviceId = extractValue(line, "\"deviceID\"");
                    requestId = extractsValue(line, "reqId");
                    System.out.println(deviceId);
                    System.out.println(requestId);
                }
                if (line.contains(requestId) && line.contains("'Response-type': 'GET_TSTAT_MODE',\\n") ) {
                    //Check for lines with same request ID
                    if (line.contains("'Response-type': 'GET_TSTAT_MODE',\\n    Status: 'FAILED',\\n")){
                        // Save set temperature command if status is failed
                        getModeCommand = "FAILED";
                    } else if (line.contains("'Response-type': 'GET_TSTAT_MODE',\\n    Status: 'SUCCESS',\\n")) {
                        // Save set temperature command if status is success
                        getModeCommand = "SUCCESS";
                    }
                }
                //Check for lines with same request ID
                if (line.contains(requestId) && line.contains("Response-type\":\"GET_DISPLAY_UNIT\"")
                        || line.contains("'Response-type': 'GET_DISPLAY_UNIT',\\n")) {
                    if (line.contains("'Response-type': 'GET_DISPLAY_UNIT',\\n    Status: 'FAILED'")
                            || line.contains("\"Response-type\":\"GET_DISPLAY_UNIT\":\"FAILED\"")) {
                        // Save display unit command if status is failed
                        displayUnitCommand = "FAILED";
                    } else {
                        // Save display unit command if status is success
                        displayUnitCommand = "SUCCESS";
                    }

                }
                if (line.contains(requestId) && line.contains("Response-type\":\"SET_TEMP\"")
                        || line.contains("'Response-type': 'SET_TEMP',\\n")) {
                    //Check for lines with same request ID
                    if (line.contains("'Response-type': 'SET_TEMP',\\n    Status: 'FAILED'")
                            || line.contains("\"Response-type\":\"SET_TEMP\":\"FAILED\"")) {
                        // Save display unit command if status is failed
                        setTempCommand = "FAILED";
                    } else {
                        // Save display unit command if status is success
                        setTempCommand = "SUCCESS";
                    }

                }
                if (setTempCommand == ""){
                    setTempCommand = "Mode OFF ";
                }
                if (displayUnitCommand == ""){
                    displayUnitCommand = "Mode OFF";
                }


                if (!getModeCommand.isEmpty()) {
                    // Print device ID, set temperature, and display unit
                    bw.write(deviceId+ "                       \t" + getModeCommand + "                       \t" + setTempCommand + "                  \t" + displayUnitCommand);
                    bw.newLine();
                    bw.newLine();
                    setTempCommand = "";
                    displayUnitCommand = "";
                    setpointCommand ="";
                    getModeCommand = "";
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // Helper method to extract value of key from JSON string
    private static String extractValue(String line, String key) {
        String value = "";
        int startIndex = line.indexOf(key) + key.length() + 2;
        int endIndex = line.indexOf("\"", startIndex);
        value = line.substring(startIndex, endIndex);
        return value;
    }

    private static String extractsValue(String line, String key) {
        String value = "";
        int startIndex = line.indexOf(key) + key.length() + 195;
        int endIndex = line.indexOf("\"", startIndex);
        value = line.substring(startIndex, endIndex);
        return value;
    }
}
