package test.java;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.Test;

import hooks.base;

public class tst extends base {

	//@Parameters({ "Mygateway" })
	//@Test
	public void addTemperature() throws InterruptedException {
		String gateway = "TESTBED-STAGE";
		String previousTemp1 = "";
		String previousTemp2 = "";
		String previousTemp3 = "";
		login.logIntoApplication();
		log("User logged in to the application");
		home.clickOnGateway(gateway);
		previousTemp1 = home.UpdatedTemp.get(0).getText();
		previousTemp2 = home.UpdatedTemp.get(1).getText();
		Thread.sleep(6000);
	//	previousTemp3 = home.UpdatedTemp.get(2).getText();
		for (int i = 0; i < 2; i++) {
			log("Clicked on " + gateway);
			log("Current Temperature = " + previousTemp1);
			home.addTemperature(i);
			try {
				home.setTemperature();
				Thread.sleep(2000);
				Assert.assertTrue(home.isElementDisplayed(home.successMesssage));
				log("Temperature updated successfully");


			}catch(Exception e)
				{
					System.out.println("Device is OFF ");
					log("device is off");
					driver.findElement(By.xpath("//button[@class='ant-modal-close']")).click();
				}
		}
		log("Temperature updated successfully");
		driver.navigate().refresh();
		home.clickOnGateway(gateway);
		//Assert.assertEquals(Integer.parseInt(home.UpdatedTemp.get(0).getText().replace("�F", "")) > Integer
				//.parseInt(previousTemp1.replace("�F", "")), true);
		//Assert.assertEquals(Integer.parseInt(home.UpdatedTemp.get(1).getText().replace("�F", "")) > Integer
				//.parseInt(previousTemp2.replace("�F", "")), true);
		//Assert.assertEquals(Integer.parseInt(home.UpdatedTemp.get(2).getText().replace("�F", "")) > Integer
			//	.parseInt(previousTemp3.replace("�F", "")), true);
		//log("Temp increased and updated Successfully");
		//home.logout();
		//log("Logout succesfully");
	}

	
	//@Parameters({ "Mygateway" })
	//@Test
	public void minusTemperature() throws InterruptedException {
		String gateway = "TESTBED-STAGE";
		String previousTemp1 = "";
		String previousTemp2 = "";
		String previousTemp3 = "";
		login.logIntoApplication();
		log("User logged in to the application");
		home.clickOnGateway(gateway);
		previousTemp1 = home.UpdatedTemp.get(0).getText();
		previousTemp2 = home.UpdatedTemp.get(1).getText();
		Thread.sleep(6000);
		//	previousTemp3 = home.UpdatedTemp.get(2).getText();
		for (int i = 0; i < 2; i++) {
			log("Clicked on " + gateway);
			log("Current Temperature = " + previousTemp1);
			home.minusTemperature(i);
			try {
				home.setTemperature();
				Thread.sleep(2000);
				Assert.assertTrue(home.isElementDisplayed(home.successMesssage));
				log("Temperature updated successfully");


			}catch(Exception e)
			{
				System.out.println("Device is OFF ");
				log("device is off");
				driver.findElement(By.xpath("//button[@class='ant-modal-close']")).click();
			}
		}
		log("Temperature updated successfully");
		driver.navigate().refresh();
		home.clickOnGateway(gateway);
		//Assert.assertEquals(Integer.parseInt(home.UpdatedTemp.get(0).getText().replace("�F", "")) > Integer
		//.parseInt(previousTemp1.replace("�F", "")), true);
		//Assert.assertEquals(Integer.parseInt(home.UpdatedTemp.get(1).getText().replace("�F", "")) > Integer
		//.parseInt(previousTemp2.replace("�F", "")), true);
		//Assert.assertEquals(Integer.parseInt(home.UpdatedTemp.get(2).getText().replace("�F", "")) > Integer
		//	.parseInt(previousTemp3.replace("�F", "")), true);
		//log("Temp increased and updated Successfully");
		//home.logout();
		//log("Logout succesfully");
	}

	//@Test

	//@Parameters({ "Mygateway" })
	/*public void getDeviceCount() throws InterruptedException {
		String gateway  = "TESTBED-STAGE";

		login.logIntoApplication();
		log("User logged in to the application");
		home.clickOnGateway(gateway);
		home.GetThermostatAndSmartSwitchCount();
		//System.out.println(home.thermoState);
		//System.out.println(home.smartSwitch	);
		//log("Thermostate count = " + home.thermoState);
		//log("SmartSwitch count = " + home.smartSwitch);
	}
	*/

	@AfterMethod
	public void tearDown() throws Exception {

		driver.quit();
	}
}
