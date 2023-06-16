package test.java;

import org.testng.annotations.Test;
import hooks.base;

import java.io.IOException;

public class confAutoReportTest extends base {
    @Test
    public void dispatch() throws InterruptedException, IOException {
        login.logIntoApplication();
        //System.out.println("Login successfully");
        //dispatchPage.sendDispatch();
        //Thread.sleep(2000);
        //addBuilding.clickOnPagination();
        login.logIntoConfluence();
        login.uploadReport();
        login.uploadDispatchReport();    }


    //@AfterMethod
    public void tearDown() throws Exception {

        driver.quit();
    }
}