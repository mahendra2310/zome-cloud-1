package test.java;

import org.testng.annotations.Test;
import hooks.base;

public class demoScriptTest extends base {
    @Test
    public void dispatch() throws Exception {
        login.logIntoApplication();
        login.properties();
        login.users();
        login.vacancy();


        //@AfterMethod
    }
}