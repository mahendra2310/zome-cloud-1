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

public class AddBuildingTest extends base {

	@Test
	@Parameters({ "Mygateway" })
	public void addBuilding() throws InterruptedException {
		login.logIntoApplication();
		log("Login successfully");
		addBuilding.addBuilding();
		Thread.sleep(2000);
		Assert.assertEquals(utilities.isElementDisplayed(addBuilding.successMessage), true);
		log("Building added successfully");
		addBuilding.clickOnPagination();
		Thread.sleep(2000);
		//Assert.assertEquals(utilities.isElementDisplayed(driver.findElement(By.xpath("//*[text()='"+addBuilding.buildingName+"']"))), true);
		//log("Building added in list");
	}




	@AfterMethod
	public void tearDown() throws Exception {

		driver.quit();
	}
}
