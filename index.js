import puppeteer from "puppeteer";
import fs from "fs";
import { userId, password } from "./user.js";

import {
  baseUrl,
  addFilterBtn,
  buyerNameCS,
  keyword,
  applyBtn,
  idS,
  addDeciMaker,
  saveBtnDmk,
  filterRemoveBtn,
  parentS,
  parentChoseS,
  sideBar,
} from "./selectors.js";

let list = fs.readFileSync("./data.json", "utf-8");

list = JSON.parse(list);

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(0);

  await page.goto(baseUrl);
  await page.type("#email", userId, { delay: 50 });
  await page.type("#password", password, { delay: 50 });
  await page.click(".btn");
  await page.waitForNetworkIdle();
  await page.goto("https://tenderbase.co.uk/tbadmin/buyers");
  await page.waitForNetworkIdle();
  await page.click(sideBar); //closing side bar
  //Data processing
  for (let i = 0; i < list.length; i++) {
    await page.click(addFilterBtn);
    await page.click(buyerNameCS);
    await page.type(keyword, list[i].buyerName, { delay: 50 });
    await page.click(applyBtn);
    await page.waitForNetworkIdle();
    let ID = await page.$$eval(idS, (items) => {
      return items.map((item) => parseInt(item.textContent.trim()));
    });
    let index = ID.indexOf(parseInt(list[i].id));
    let editBtn;

    if (index !== -1) {
      editBtn = `#listTable>tbody>tr:nth-child(${
        index + 1
      })>td:nth-child(11)>div>div>div>button`;
    }

    for (let j = 0; j < list[i].employees.length; j++) {
      await page.click(sideBar); //closing side bar
      await page.click(editBtn); //edit buyer or add dcmaker
      await page.evaluate((addDeciMaker) => {
        document.querySelector(addDeciMaker).click();
      }, addDeciMaker);

      await page.waitForNetworkIdle();
      if (list[i].employees[j].parent !== "") {
        await page.click(parentS);
        await page.waitForNetworkIdle();
        await page.type(
          ".select2-search__field",
          list[i].employees[j].parent.trim(),
          {
            delay: 50,
          }
        );
        await page.waitForNetworkIdle();
        await page.click(parentChoseS);
      }

      await page.type("#personName", list[i].employees[j].name, { delay: 50 });

      if (list[i].employees[j].designation === "") {
        console.log("Designation not added, Please add designation");
        break;
      } else {
        await page.type("#designation", list[i].employees[j].designation, {
          delay: 50,
        });
      }

      if (list[i].employees[j].phone !== "") {
        await page.type("#phone", list[i].employees[j].phone, { delay: 50 });
      }

      if (list[i].employees[j].email !== "") {
        await page.type("#email", list[i].employees[j].email, { delay: 50 });
      }
      await page.click(saveBtnDmk);
      await page.waitForNetworkIdle();
      console.log(
        `${j + 1} of ${list[i].employees.length} of ${
          list[i].buyerName
        } added successfully`
      );
    }
    await page.click(filterRemoveBtn);
    await page.waitForNetworkIdle();
    console.log(`${list[i].buyerName} added successfully`);
    console.log(`---------------------------------------`);
  }

  console.log("Congratulation! You have done your job successfully!");
  await browser.close();
})();
