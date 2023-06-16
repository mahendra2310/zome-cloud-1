package pageobjects;

import java.security.SecureRandom;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import hooks.Utilities;
import hooks.base;
import org.testng.annotations.Test;

public class addUserPage {

	WebDriver driver;
	Utilities utilities;
	
	@FindBy(xpath = "(//div[@class='svg-icon'])[6]")
	WebElement btnUserIcon;
	
	@FindBy(xpath = "(//button[contains(@class,'addUserbtn')])[2]")
	WebElement btnAddUser;
	
	
	@FindBy(xpath = "//input[@placeholder='Full Name']")
	WebElement txtFullName;
	
	@FindBy(xpath = "//input[@placeholder='Email']")
	WebElement txtEmail;
	
	@FindBy(xpath = "//input[@placeholder='UserName']")
	WebElement txtUserName;
	
	@FindBy(xpath = "//input[@placeholder='Password']")
	WebElement txtPassword;
	
	@FindBy(xpath = "(//select[contains(@class,'form-control')])[1]")
	WebElement dropdownPropertyId;
	
	@FindBy(xpath = "(//select[contains(@class,'form-control')])[2]")
	WebElement dropdownBuildingName;
	
	@FindBy(xpath = "//button[contains(@class,'login-btn-style white-text-color block cursor-pointer text-center')]")
	WebElement btnSaveUser;
	
	@FindBy(xpath = "//li[@title='Next Page'][@aria-disabled='false']")
	WebElement btnNextButton;
	
	@FindBy(xpath = "//*[text()='User created']")
	public WebElement successMessage;

	@FindBy(xpath = "//*[text()='Add User']")
	public WebElement AddButton;
	

	public addUserPage(WebDriver driver) {
		this.driver = driver;
		utilities=new Utilities(driver);
		PageFactory.initElements(driver, this);
	}
    public String email;

	public void addUser() throws InterruptedException {
		btnUserIcon.click();
		utilities.waitForElementToDisplay(btnAddUser);
		btnAddUser.click();
		txtFullName.sendKeys("Test");
		email=utilities.numericStringGenerator(7)+"@yopmail.com";
		txtEmail.sendKeys(email);
		txtUserName.sendKeys(utilities.numericStringGenerator(5));
		txtPassword.sendKeys("Test@123");
		Thread.sleep(2000);
		utilities.selectDropDownByIndex(dropdownPropertyId,3);
		Thread.sleep(4000);
		//utilities.selectDropDownByIndex(dropdownBuildingName,2);
		utilities.scrollDownUntilElementIsVisible(btnSaveUser);
		Thread.sleep(3000);
		btnSaveUser.click();
	}
	
	public void clickOnPagination() throws InterruptedException  {
		driver.navigate().refresh();
		Thread.sleep(2000);
		driver.manage().window().fullscreen();
		utilities.waitForElementToDisplay(btnUserIcon);
		Thread.sleep(1000);
		btnUserIcon.click();
		//utilities.waitForElementToDisplay(btnAddUser);
		//while(utilities.isElementDisplayed(btnNextButton)) {
		//	Thread.sleep(1000);
		//	btnNextButton.click();
		//}
		driver.findElement(By.xpath("//input[@id='rc_select_0']")).click();
		driver.findElement(By.xpath("//div[@class='ant-select-item-option-content'][normalize-space()='DJ']")).click();
		driver.findElement(By.xpath("//button[contains(@class,'addUserbtn white-text-color block cursor-pointer text-center mt-5')]")).click();
		utilities.waitForElementToDisplay(btnAddUser);
		while(utilities.isElementDisplayed(btnNextButton)) {
			Thread.sleep(1000);
			btnNextButton.click();
		}

	}    
}
