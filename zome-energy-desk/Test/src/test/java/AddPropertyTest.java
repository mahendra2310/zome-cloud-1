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

public class AddPropertyTest extends base {

	@Test
	@Parameters({ "Mygateway" })
	public void addProperty() throws InterruptedException {
		login.logIntoApplication();
		log("Login successfully");
		addProperty.addProperty();
		//Thread.sleep(4000);

		//Assert.assertEquals(utilities.isElementDisplayed(addProperty.successMessage), true);
		//log("Property added successfully");
		//addProperty.clickOnPagination();
		//Thread.sleep(2000);
		//Assert.assertEquals(utilities.isElementDisplayed(driver.findElement(By.xpath("//*[text()='"+addProperty.meterNumber+"']"))), true);
		//log("Property added property list ");
	}

	@Test
	//@Parameters({ "Mygateway" })
	public void mapView() throws InterruptedException {
		login.logIntoApplication();
		addProperty.clickOnMapView();
		Thread.sleep(2000);
		Assert.assertTrue(driver.getCurrentUrl().contains("location"));
	}



	//@AfterMethod
	public void tearDown() throws Exception {

		driver.quit();
	}
}
