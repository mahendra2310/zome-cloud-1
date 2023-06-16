package test.java;



import hooks.logDownload;
import hooks.parser;
import org.testng.annotations.Test;

public class parseTest {
    public static hooks.parser parser;
    public static hooks.logDownload logDownload;
    public static hooks.unzip unzip;

    @Test
    public static void log() throws InterruptedException {
        parser = new parser();
        logDownload = new logDownload();
        logDownload.download();
        unzip.unzip();
        parser.parse();
    }




}
