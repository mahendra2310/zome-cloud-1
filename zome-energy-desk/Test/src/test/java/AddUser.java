package test.java;

import java.util.concurrent.TimeUnit;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.ITestAnnotation;
import org.testng.annotations.Parameters;
import org.testng.annotations.Test;

import com.beust.jcommander.Parameter;

import hooks.base;
import pageobjects.homepage;
import pageobjects.loginpage;

public class AddUser extends base {

	@Test
	@Parameters({ "Mygateway" })
	public void addUser() throws InterruptedException {
		login.logIntoApplication();
		log("User Login successfully");
		addUser.addUser();
		//Assert.assertEquals(utilities.isElementDisplayed(addUser.successMessage), true);
		//log("User added successfully");
		//addUser.clickOnPagination();
		//Assert.assertEquals(utilities.isElementDisplayed(driver.findElement(By.xpath("//*[text()='"+addUser.email+"']"))), true);
		//log("User added user list");
	}




	@AfterMethod
	public void tearDown() throws Exception {

		driver.quit();
	}
}
