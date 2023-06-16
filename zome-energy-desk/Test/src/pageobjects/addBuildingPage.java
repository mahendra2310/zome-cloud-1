package pageobjects;

import java.security.SecureRandom;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import hooks.Utilities;
import hooks.base;

public class addBuildingPage {

	WebDriver driver;
	Utilities utilities;
	
	@FindBy(xpath = "(//div[@class='svg-icon'])[9]")
	WebElement btnAdmintrationIcon;
	
	
	@FindBy(xpath = "//div[@aria-controls='rc-tabs-0-panel-3']")
	WebElement tabBuilding;
	
	@FindBy(xpath = "//span[contains(text(),'Add Building')]")
	WebElement btnAddBuilding;
	
	
	@FindBy(xpath = "//input[@placeholder='Building Name']")
	WebElement txtBuildingName;
	
	@FindBy(xpath = "(//select[contains(@class,'form-control')])[1]")
	WebElement dropdownPropertyId;
	
	@FindBy(xpath = "//input[@placeholder='City']")
	WebElement txtCity;
	
	@FindBy(xpath = "//input[@placeholder='Address']")
	WebElement txtAddress;
	
	
	@FindBy(xpath = "//button[contains(@class,'login-btn')][@type='submit']")
	WebElement btnSaveBuilding;
	
	@FindBy(xpath = "(//li[@title='Next Page'][@aria-disabled='false'])[2]")
	WebElement btnNextButton;
	
	@FindBy(xpath = "//*[text()='New Building created successfully']")
	public WebElement successMessage;

	@FindBy(xpath = "//*[text()='select property id']")
	public WebElement buildingDrop;

	@FindBy(xpath = "//*[text()='Test']")
	public WebElement buildingdropTest;

	public addBuildingPage(WebDriver driver) {
		this.driver = driver;
		utilities=new Utilities(driver);
		PageFactory.initElements(driver, this);
	}
    public String buildingName;
	
	public void addBuilding() throws InterruptedException {
		btnAdmintrationIcon.click();
		utilities.waitForElementToDisplay(tabBuilding);
		tabBuilding.click();
		Thread.sleep(6000);
		utilities.waitForElementToDisplay(btnAddBuilding);
		btnAddBuilding.click();
		buildingName=utilities.numericStringGenerator(7);
		utilities.waitForElementToDisplay(txtBuildingName);
		txtBuildingName.sendKeys(buildingName);
		//Thread.sleep(4000);
		//buildingDrop.click();
		//Thread.sleep(1000);
		//buildingdropTest.click();
		utilities.selectDropDownByIndex(dropdownPropertyId, 2);
		txtCity.sendKeys("kota");
		txtAddress.sendKeys("Kota, Rajasthan");
		btnSaveBuilding.click();	
	}
	
	public void clickOnPagination() throws InterruptedException  {
		utilities.waitForElementToDisplay(tabBuilding);
		while(utilities.isElementDisplayed(btnNextButton)) {
			btnNextButton.click();
		}	
	}    
}
