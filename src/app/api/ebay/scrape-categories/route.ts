import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";

interface Category {
  name: string;
  id: string;
  subcategories: Category[];
}

export async function GET(req: NextRequest) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(
    "https://pages.ebay.com/sellerinformation/news/categorychanges/preview2023.html"
  );

  const categories: Category = await page.evaluate(() => {
    function extractCategories(element: Element): Category {
      const category: Category = {
        name: element.querySelector("p")!.innerText,
        id: element.querySelector("p")!.innerText.match(/ID: (\d+)/)![1],
        subcategories: [],
      };

      const subcategoryElements = element.querySelectorAll(":scope > ul > li");
      subcategoryElements.forEach((subcategoryElement) => {
        category.subcategories.push(extractCategories(subcategoryElement));
      });

      return category;
    }

    const rootElement = document.querySelector("#categoryList > li");
    return extractCategories(rootElement!);
  });

  await browser.close();

  return NextResponse.json({ categories });
}
