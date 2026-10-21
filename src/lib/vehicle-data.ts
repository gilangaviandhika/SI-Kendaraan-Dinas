export type Status = "Tersedia" | "Digunakan";
export type Kendaraan = {
  nopol: string; merk: string; driver: string; area: string; admin: string;
  odo: number | null; kml: number | null; status: Status;
};
export type Trip = {
  id: number; nopol: string; driver: string; tujuan: string; satpamOut: string;
  outAt: number; odoOut: number; fotoOut: string[];
  satpamIn?: string; inAt?: number; odoIn?: number; fotoIn?: string[]; kondisi?: string;
  user?: string; bidang?: string;
};

// Source: DATA_DRIVER_1.xlsx, DRIVER sheet. Odometer and efficiency were not supplied.
export const kendaraan0: Kendaraan[] = [
  {
    "nopol": "B 2240 PYF",
    "merk": "INNOVA ZENIQ",
    "driver": "EGI RIFKI TRIADI",
    "area": "UPT BANDUNG",
    "admin": "DIKI AHMAD SOLIHIN",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "B 2245 PYF",
    "merk": "INNOVA ZENIQ",
    "driver": "GUNGUN GUNAWAN",
    "area": "UPT BANDUNG",
    "admin": "DIKI AHMAD SOLIHIN",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 7485 AU",
    "merk": "TOYOTA HIACE",
    "driver": "DADAN WARDANI",
    "area": "UPT BANDUNG",
    "admin": "DIKI AHMAD SOLIHIN",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 1530 AMQ",
    "merk": "MITSUBISHI XPANDER",
    "driver": "AFANDI",
    "area": "UPT BANDUNG",
    "admin": "DIKI AHMAD SOLIHIN",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 1531 AMQ",
    "merk": "MITSUBISHI XPANDER",
    "driver": "SENDI PRIBADI",
    "area": "UPT BANDUNG",
    "admin": "DIKI AHMAD SOLIHIN",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 1532 AMQ",
    "merk": "MITSUBISHI XPANDER",
    "driver": "DEDE AL-HAMSAH",
    "area": "UPT BANDUNG",
    "admin": "DIKI AHMAD SOLIHIN",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 1533 AMQ",
    "merk": "MITSUBISHI XPANDER",
    "driver": "M NUR HOLIS MAJID",
    "area": "UPT BANDUNG",
    "admin": "DIKI AHMAD SOLIHIN",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 1526 AMQ",
    "merk": "MITSUBISHI XPANDER",
    "driver": "M FAISHAL FIRDAUS",
    "area": "UPT BANDUNG",
    "admin": "DIKI AHMAD SOLIHIN",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "8529",
    "merk": "TRUCK CRANE",
    "driver": "UJANG PURNOMO",
    "area": "UPT BANDUNG",
    "admin": "DIKI AHMAD SOLIHIN",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 7886 AU",
    "merk": "TOYOTA HILUX",
    "driver": "IBNU HAMAM MUSTAQIM",
    "area": "UPT BANDUNG",
    "admin": "DIKI AHMAD SOLIHIN",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 7020 BL",
    "merk": "ISUZU ELF",
    "driver": "CHANDRA HERMAWAN",
    "area": "UPT BANDUNG",
    "admin": "DIKI AHMAD SOLIHIN",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 1525 AMQ",
    "merk": "MITSUBISHI XPANDER",
    "driver": "WANDI RUSWANDI",
    "area": "UPT BANDUNG",
    "admin": "DIKI AHMAD SOLIHIN",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "E 8262 KX",
    "merk": "TOYOTA HIACE",
    "driver": "BENI NURDANI",
    "area": "UPT BANDUNG",
    "admin": "DIKI AHMAD SOLIHIN",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 8239 GL",
    "merk": "ISUZU D-MAX",
    "driver": "DADAN WARDANI",
    "area": "UPT BANDUNG",
    "admin": "DIKI AHMAD SOLIHIN",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 8289 FV",
    "merk": "TOYOTA HILUX",
    "driver": "BUDI MAHMUDIN",
    "area": "ULTG BANDUNG BARAT",
    "admin": "DEDI HERNADI",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 8288 FV",
    "merk": "TOYOTA HILUX",
    "driver": "BUDI MAHMUDIN",
    "area": "ULTG BANDUNG BARAT",
    "admin": "DEDI HERNADI",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 7483 AU",
    "merk": "TOYOTA HIACE",
    "driver": "HENDRI HERMAWAN",
    "area": "ULTG BANDUNG BARAT",
    "admin": "DEDI HERNADI",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 8926 FU",
    "merk": "MITSUBISHI L300",
    "driver": "HENDRIAN",
    "area": "ULTG BANDUNG BARAT",
    "admin": "DEDI HERNADI",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 7484 AU",
    "merk": "TOYOTA HIACE",
    "driver": "RUHIMAT",
    "area": "ULTG BANDUNG BARAT",
    "admin": "DEDI HERNADI",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 1535 AMQ",
    "merk": "MITSUBISHI XPANDER",
    "driver": "RUDI RONIADO",
    "area": "ULTG BANDUNG BARAT",
    "admin": "DEDI HERNADI",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 1534 AMQ",
    "merk": "MITSUBISHI XPANDER",
    "driver": "HANDI",
    "area": "ULTG BANDUNG BARAT",
    "admin": "DEDI HERNADI",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 1536 AMQ",
    "merk": "MITSUBISHI XPANDER",
    "driver": "ANDHI BUDIYANTO",
    "area": "ULTG BANDUNG SELATAN",
    "admin": "BUDI RACHMAT SETIA",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 8286 FV",
    "merk": "TOYOTA HILUX",
    "driver": "ACEP SUKANDAR",
    "area": "ULTG BANDUNG SELATAN",
    "admin": "BUDI RACHMAT SETIA",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 7480 AU",
    "merk": "TOYOTA HIACE",
    "driver": "NOVI MAULANA",
    "area": "ULTG BANDUNG SELATAN",
    "admin": "BUDI RACHMAT SETIA",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 7479 AU",
    "merk": "TOYOTA HIACE",
    "driver": "DINDIN WAHYUDIN",
    "area": "ULTG BANDUNG SELATAN",
    "admin": "BUDI RACHMAT SETIA",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 8927 FU",
    "merk": "MITSUBISHI L300",
    "driver": "SANI PRIATNA",
    "area": "ULTG BANDUNG SELATAN",
    "admin": "BUDI RACHMAT SETIA",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "Z 8821 EA",
    "merk": "TOYOTA HILUX",
    "driver": "WILDAN SYAHID",
    "area": "ULTG BANDUNG SELATAN",
    "admin": "BUDI RACHMAT SETIA",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "Z 8820 EA",
    "merk": "TOYOTA HILUX",
    "driver": "DEDE ROHIMAN",
    "area": "ULTG BANDUNG TIMUR",
    "admin": "YADI KUSTIANA",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 8285 FV",
    "merk": "TOYOTA HILUX",
    "driver": "SOLEH",
    "area": "ULTG BANDUNG TIMUR",
    "admin": "YADI KUSTIANA",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 7481 AU",
    "merk": "TOYOTA HIACE",
    "driver": "BUDI RACHMAT",
    "area": "ULTG BANDUNG TIMUR",
    "admin": "YADI KUSTIANA",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 1537 AMQ",
    "merk": "MITSUBISHI XPANDER",
    "driver": "M CECEP BUSROL KARIM",
    "area": "ULTG BANDUNG TIMUR",
    "admin": "YADI KUSTIANA",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 8925 FU",
    "merk": "MITSUBISHI L300",
    "driver": "ANDRE JULIANTO PRATAMA",
    "area": "ULTG BANDUNG TIMUR",
    "admin": "YADI KUSTIANA",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  },
  {
    "nopol": "D 7482 AU",
    "merk": "TOYOTA HIACE",
    "driver": "RYAN AJI KURNIA",
    "area": "ULTG BANDUNG TIMUR",
    "admin": "YADI KUSTIANA",
    "odo": null,
    "kml": null,
    "status": "Tersedia"
  }
];
export const drivers0 = [...new Set(kendaraan0.map((k) => k.driver))];
export const areas0 = [...new Set(kendaraan0.map((k) => k.area))];
export const trips0: Trip[] = [];
