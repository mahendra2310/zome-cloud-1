package pageobjects;

import java.security.SecureRandom;
import java.util.List;

import io.netty.handler.codec.spdy.DefaultSpdyGoAwayFrame;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import hooks.Utilities;
import hooks.base;

public class addPropertyPage{

	WebDriver driver;
	Utilities utilities;

	@FindBy(xpath = "(//div[@class='svg-icon'])[3]")
	WebElement btnAllPropertyIcon;
	
	@FindBy(xpath = "(//div[@class='svg-icon'])[5]")
	WebElement btnMapViewIcon;

	@FindBy(xpath = "//span[text()='Add Property']")
	WebElement btnAddProperty;
	
	@FindBy(xpath = "//input[@placeholder='Property Name']")
	WebElement txtPropertyName;
	
	@FindBy(xpath = "//input[@placeholder='Meter No']")
	WebElement txtMeterNo;
	
	@FindBy(xpath = "//input[@placeholder='Zipcode']")
	WebElement txtZipCode;
	
	@FindBy(xpath = "//input[@placeholder='Address']")
	WebElement txtAddress;
	
	@FindBy(xpath = "//button[@type='submit']/span[text()='Add Property']") 
	WebElement btnSubmitProperty;
	
	@FindBy(xpath = "//*[text()='New property added successfully']")
	public WebElement successMessage;
	
	@FindBy(xpath = "//li[@title='Next Page'][@aria-disabled='false']")
	WebElement btnNextButton;


	public addPropertyPage(WebDriver driver) {
		this.driver = driver;
		utilities=new Utilities(driver);
		PageFactory.initElements(driver, this);
	}
	
	public String meterNumber;
	

	public void addProperty() throws InterruptedException {
		utilities.waitForElementToDisplay(btnAllPropertyIcon);
		btnAllPropertyIcon.click();
		utilities.waitForElementToDisplay(btnAddProperty);
		btnAddProperty.click();
		txtPropertyName.sendKeys("Test");
		meterNumber=utilities.numericStringGenerator(17);
		txtMeterNo.sendKeys(meterNumber);
		txtZipCode.sendKeys("324005");
		Thread.sleep(2000);
		txtAddress.sendKeys("Kota"+Keys.ENTER);
		utilities.scrollDownUntilElementIsVisible(btnSubmitProperty);
		utilities.waitForElementToDisplay(btnSubmitProperty);
		Thread.sleep(4000);
		txtAddress.sendKeys(""+Keys.ENTER);
		btnSubmitProperty.click();
		//Thread.sleep(4000);
	
	}
	
	public void clickOnPagination(){
		utilities.scrollDownUntilElementIsVisible(btnNextButton);
		utilities.waitForElementToDisplay(btnNextButton);
		while(utilities.isElementDisplayed(btnNextButton)) {
			btnNextButton.click();
		}	
	
	}
	  	    
	    public void clickOnMapView() {
	    	utilities.waitForElementToDisplay(btnMapViewIcon);
	    	btnMapViewIcon.click();
	    }

}
