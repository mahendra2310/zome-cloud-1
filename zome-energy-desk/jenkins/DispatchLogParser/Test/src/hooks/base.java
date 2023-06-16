package hooks;

import java.awt.*;
import java.io.File;
import java.io.IOException;
import java.lang.reflect.Method;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.apache.commons.io.FileUtils;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.ITestResult;
import org.testng.Reporter;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.AfterTest;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.BeforeTest;
import com.relevantcodes.extentreports.ExtentReports;
import com.relevantcodes.extentreports.ExtentTest;
import com.relevantcodes.extentreports.LogStatus;

import pageobjects.*;


public class base {

	public WebDriver driver;
	public static ExtentReports extent;
	public ExtentTest logger;
	public loginpage login;

	public Utilities utilities;
	public dispatchPage dispatchPage;

	@BeforeSuite
	public void beforeEachTest() {
		 getInstance();
	}

	
	public ExtentReports getInstance() {
		if (extent == null) {
			extent = new ExtentReports(System.getProperty("user.dir") +"/test-output/ExtentReport.html", true);
			extent.loadConfig(new File(System.getProperty("user.dir") + "//extent-config.xml"));
		}
		return extent;
	}
	
	public void log(String data) {
		Reporter.log(data);
		logger.log(LogStatus.INFO, data);
	}


	public void StartTesting(String TestName) {
		ExtentReports rep = getInstance();
		logger = rep.startTest(TestName);
	}

	@AfterTest
	public void afterEachTest() {
		System.out.println("This is exceuted after each Test");
	}
	
	public String getScreenShot(String fileName) throws IOException {
		String pathScreenShotsFolder = System.getProperty("user.dir");

		try {
			File scrFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
			FileUtils.copyFile(scrFile, new File(pathScreenShotsFolder + "/test-output/screenshots/" + fileName + ".png"));
			fileName = pathScreenShotsFolder + "/" + fileName + ".png";
			return fileName;
		} catch (Exception e) {
		}
		return fileName;
	}

	@AfterMethod
	public void getResult(ITestResult result) throws IOException {
		
		
		if (logger==null){
			logger=extent.startTest("Starting Test");
		}			 		
		if (result.getStatus() == ITestResult.FAILURE) {		
			logger.log(LogStatus.FAIL, "Test Case " + result.getName() + " is Failed");
			String screenshot_path = getScreenShot(result.getName());
			String image = logger.addScreenCapture(screenshot_path);
			logger.log(LogStatus.FAIL, "Title verification", image);
			logger.log(LogStatus.FAIL, "Test Case Failed is " + result.getThrowable());
		} else if (result.getStatus() == ITestResult.SKIP) {
			logger.log(LogStatus.SKIP, "Test Case " + result.getName() + " is Skipped");
			String screenshot_path = getScreenShot(result.getName());
			String image = logger.addScreenCapture(screenshot_path);
			logger.log(LogStatus.SKIP, "Title verification", image);
		} else if (result.getStatus() == ITestResult.SUCCESS) {
			logger.log(LogStatus.PASS, "Test Case " + result.getName() + " is passed");
			String screenshot_path = getScreenShot(result.getName());
			String image = logger.addScreenCapture(screenshot_path);
			logger.log(LogStatus.PASS, "Title verification", image);
		}
		extent.endTest(logger);
		driver.quit();
	}

    //@BeforeMethod
	public void setUp(Method method) throws AWTException {
    	//System.setProperty("webdriver.chrome.driver", "D:\\Eclipse-Project\\chromedriver\\chromedriver.exe");
		WebDriverManager.chromedriver().setup();

		Map<String, Object> prefs = new HashMap<String, Object>();
		prefs.put("download.default_directory",
				System.getProperty("user.dir") + File.separator + "home");
		ChromeOptions options = new ChromeOptions();
		options.setExperimentalOption("prefs", prefs);
		// options.setExperimentalOption("prefs", "{download.default_directory: C:\\Users\\Arsany\\Desktop\\");
		options.addArguments("--headless");
		options.addArguments("--no-sandbox");
		options.addArguments("--ignore-certificate-errors");

		driver = new ChromeDriver(options);


		// Navigate to the webpage

		// Find all the link elements with the specified pattern




		//driver.get("http://18.212.191.239:8080/");
		login = new loginpage(driver);
		utilities=new Utilities(driver);
		dispatchPage = new dispatchPage(driver);
		driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
		driver.manage().window().fullscreen();
		StartTesting(method.getName());
	}
    
    @AfterTest
    public void afterSuite() {
    	extent.flush();
    	extent.close();
    }
    
  
}
