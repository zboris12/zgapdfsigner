import * as m_fs from "node:fs";
import * as  m_path from "node:path";
import * as Zga from "zgapdfsigner";

const workpath = "./";

async function sign_protect(pdfPath: string, pfxPath: string, ps: string, perm: number, imgPath?: string, txt?: string, fontPath?: string): Promise<string> {
  let pdf: Buffer = m_fs.readFileSync(pdfPath);
  let pfx: Buffer = m_fs.readFileSync(pfxPath);
  let img: Buffer | undefined = undefined;
  let imgType: string = "";
  let font: Buffer | undefined = undefined;

  if (perm == 1) {
    console.log("\nTest signing pdf with full protection. (permission 1 and password encryption)");
  } else {
    console.log("\nTest signing pdf with permission " + perm);
  }

  if (imgPath) {
    img = m_fs.readFileSync(imgPath);
    imgType = m_path.extname(imgPath).slice(1);
  }
  if (fontPath) {
    font = m_fs.readFileSync(fontPath);
  }
  let sopt: Zga.SignOption = {
    p12cert: pfx,
    pwd: ps,
    permission: perm,
    signdate: "1",
    reason: "I have a test reason " + perm + ".",
    location: "I am on the earth " + perm + ".",
    contact: "zga" + perm + "@zga.com",
    ltv: 1,
    debug: true,
  };
  if (img || txt) {
    sopt.drawinf = {
      area: {
        x: 25, // left
        y: 50, // top
        w: txt ? undefined : 60,
        h: txt ? undefined : 100,
      },
      pageidx: "-",
      imgInfo: img ? {
        imgData: img,
        imgType: imgType,
      } : undefined,
      textInfo: txt ? {
        text: txt,
        fontData: font,
        color: "00f0f1",
        lineHeight: 20,
        size: 16,
        align: 1,
        wMax: 80,
        yOffset: 10,
        xOffset: 20,
        noBreaks: "[あいうえおA-Za-z0-9]",
      } : undefined,
    };
  }

  let eopt: Zga.EncryptOption | undefined = undefined;
  if (perm == 1) {
    eopt = {
      mode: Zga.Crypto.Mode.AES_256,
      permissions: ["copy", "copy-extract", "print-high"],
      userpwd: "123",
    };
  }

  let ser: Zga.PdfSigner = new Zga.PdfSigner(sopt);
  let u8dat: Uint8Array = await ser.sign(pdf, eopt);
  let outPath: string = "";
  if (u8dat) {
    outPath = m_path.join(__dirname, workpath + "test_perm" + perm + m_path.basename(pdfPath));
    m_fs.writeFileSync(outPath, u8dat);
    console.log("Output file: " + outPath);
  }
  return outPath;
}

async function addtsa(pdfPath: string): Promise<string> {
  console.log("\nTest signing pdf by a timestamp.");

  let pdf: Buffer = m_fs.readFileSync(pdfPath);
  let sopt: Zga.SignOption = {
    signdate: "2",
    reason: "I have a test reason tsa.",
    location: "I am on the earth tsa.",
    contact: "zgatsa@zga.com",
    ltv: 1,
    debug: true,
  };
  let ser: Zga.PdfSigner = new Zga.PdfSigner(sopt);
  let u8dat: Uint8Array = await ser.sign(pdf);
  let outPath: string = m_path.join(__dirname, workpath + "tsa_" + m_path.basename(pdfPath));
  m_fs.writeFileSync(outPath, u8dat);
  console.log("Output file: " + outPath);
  return outPath;
}

async function main1(angle: number): Promise<void> {
  let pdfPath: string = m_path.join(__dirname, workpath + "_test" + (angle ? "_" + angle : "") + ".pdf");
  let pfxPath: string = m_path.join(__dirname, workpath + "_test.pfx");
  let ps: string = "";
  let imgPath: string = m_path.join(__dirname, workpath + "_test.png");
  let fontPath: string = m_path.join(__dirname, workpath + "_test.ttf");

  if (process.argv.length > 3) {
    pfxPath = process.argv[2];
    ps = process.argv[3];
  } else if (process.argv[2]) {
    ps = process.argv[2];
  }

  if (!ps) {
    // throw new Error("The passphrase is not specified.");
    pfxPath = "";
  }

  if (pfxPath) {
    await sign_protect(pdfPath, pfxPath, ps, 1, imgPath, "あいうえおあいうえおか\r\n\nThis is a test of text!\n", fontPath);
    pdfPath = await sign_protect(pdfPath, pfxPath, ps, 2, undefined, "ありがとうご\r\n\nThis is an another test of text!\n", fontPath);
    await addtsa(pdfPath);
  } else {
    await addtsa(pdfPath);
  }

  console.log("Done");
}

async function main(): Promise<void> {
  let arr: Array<number> = [0, 90, 180, 270];
  for (let i = 0; i < arr.length; i++) {
    await main1(arr[i]);
    // break;
  }
}

main();
