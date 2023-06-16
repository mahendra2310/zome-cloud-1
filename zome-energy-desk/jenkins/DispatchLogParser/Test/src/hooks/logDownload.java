package hooks;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.FluentWait;
import java.io.File;
import java.time.Duration;
import java.util.*;

public class logDownload {
    public static long maxTimestamp;

    public void download() throws InterruptedException {


        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();

        options.addArguments("--headless");
        options.addArguments("--no-sandbox");
        options.addArguments("--ignore-certificate-errors");

       WebDriver driver = new ChromeDriver(options);

        String downloadFilepath = "C:\\Users\\Arsany\\Desktop";
        Map<String, Object> prefs = new HashMap<String, Object>();
        prefs.put("download.default_directory",
                System.getProperty("user.dir") + File.separator + "Arsany" + File.separator + "Desktop");
        options = new ChromeOptions();
        options.setExperimentalOption("prefs", prefs);
        // options.setExperimentalOption("prefs", "{download.default_directory: C:\\Users\\Arsany\\Desktop\\");


        // Navigate to the webpage
        driver.get("http://ec2-3-90-212-158.compute-1.amazonaws.com:3000/dev-gateway-system-logs/filetotransfer/gwmac_70:b3:d5:9a:ed:0c");

        // Find all the link elements with the specified pattern
        List<WebElement> linkElements = driver.findElements(By.xpath("//a[contains(@href,'syslogs_')]"));

        // Create a list to store the Unix timestamps
        List<Long> unixTimestamps = new ArrayList<>();

        // Iterate through the link elements to extract the Unix timestamps
        for (WebElement linkElement : linkElements) {
            String href = linkElement.getAttribute("href");
            String[] parts = href.split("/");
            String filename = parts[parts.length - 1];
            String timestampStr = filename.substring(filename.indexOf("_") + 1, filename.indexOf(".tar"));
            long unixTimestamp = Long.parseLong(timestampStr);
            unixTimestamps.add(unixTimestamp);
        }
        System.out.println(unixTimestamps);
        // Find the index of the maximum Unix timestamp
        int maxIndex = unixTimestamps.indexOf(Collections.max(unixTimestamps));
        maxTimestamp = unixTimestamps.get(maxIndex);

// Print the maxTimestamp value to verify that it's correct
        System.out.println(maxTimestamp);
        // Click on the link with the maximum Unix timestamp
        linkElements.get(maxIndex).click();
        //wait.until( x -> file.exists());
        Thread.sleep(9000);
        Thread.sleep(9000);
        Thread.sleep(9000);
        Thread.sleep(9000);


        System.out.println(maxIndex);
        //Close the browser window
        driver.quit();
    }

}