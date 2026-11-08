# Edit decision list for the Zanzibar + Mikumi safari vlog. Sections run in story order.
# Each shot is (clip, start_seconds, duration_seconds) or (clip, start, duration, "focus").
# "focus" shots keep the camera sound up and the music down (animals, party). Speech anywhere
# is found automatically and ducked the same way. The only on-screen text is the opening title.
F = "focus"

SECTIONS = [
    # --- Zanzibar days (not in the script, added at the start) ---
    ("Zanzibarga yetib keldik", "Zanzibar.mp3", [
        ("IMG_1225", 0.0, 6.6), ("IMG_1234", 0.0, 10.0), ("IMG_1243", 2.0, 8.0), ("IMG_1244", 3.0, 8.0),
        ("IMG_1243", 16.0, 6.0), ("IMG_1260", 0.0, 4.0), ("IMG_1260", 22.0, 8.0),
    ]),
    ("Kvadrotsikllar", "Adventures in Adventureland.mp3", [
        ("IMG_1328", 0.0, 7.0), ("IMG_1333", 15.0, 6.0), ("IMG_1332", 20.0, 6.0), ("IMG_1337", 10.0, 7.0),
        ("IMG_1335", 20.0, 6.0), ("IMG_1338", 30.0, 6.0), ("IMG_1339", 20.0, 7.0),
    ]),
    ("Qishloq va bolalar", "Island Meet and Greet.mp3", [
        ("IMG_1322", 25.0, 8.0), ("IMG_1326", 0.0, 7.0), ("IMG_1324", 0.0, 8.0), ("IMG_1307", 0.0, 10.0),
        ("IMG_1318", 0.0, 9.0), ("IMG_1320", 10.0, 7.0), ("IMG_1329", 0.0, 6.0), ("IMG_1266", 0.0, 9.0),
        ("IMG_1267", 0.0, 6.0),
    ]),
    ("Plyaj, kechqurun, kechki ovqat", "Moonlight Beach.mp3", [
        ("IMG_1342", 4.0, 7.0), ("IMG_1344", 8.0, 9.0), ("IMG_1345", 0.0, 7.0), ("IMG_1349", 5.0, 6.0),
        ("IMG_1355", 0.0, 9.0), ("IMG_1361", 0.0, 10.0), ("IMG_1375", 0.0, 8.0), ("IMG_1381", 0.0, 14.0),
    ]),
    ("Tusovka", "Ethernight Club.mp3", [
        ("IMG_1382", 0.0, 12.0, F), ("IMG_1383", 0.0, 13.0, F), ("IMG_1384", 0.0, 10.0, F),
    ]),
    # --- Safari day, following the script ---
    ("Aeroport va pirpirakli samolyot", "Journey To Ascend.mp3", [
        ("IMG_1404", 0.5, 8.5), ("IMG_1397", 0.0, 12.0), ("IMG_1403", 0.0, 11.0), ("IMG_1405", 0.0, 9.0),
        ("IMG_1411", 2.0, 10.0), ("IMG_1412", 0.0, 15.0), ("IMG_1413", 2.0, 14.0), ("IMG_1414", 0.0, 9.0),
    ]),
    ("Savannaga qo'nish, vnedorojniklar, gid", "Savannah Sketch.mp3", [
        ("IMG_1558", 1.0, 8.0), ("IMG_1558", 10.0, 7.0), ("IMG_1565", 2.0, 15.0), ("IMG_1567", 2.0, 12.0),
        ("IMG_1580", 5.0, 12.0),
    ]),
    ("Begemot va krokodillar ko'li", "Savannah Sketch.mp3", [
        ("IMG_1440", 0.0, 8.0), ("IMG_1440", 16.0, 5.0), ("IMG_1441", 0.0, 4.0), ("IMG_1441", 8.0, 6.0),
        ("IMG_1581", 2.0, 8.0), ("IMG_1581", 14.0, 8.0), ("IMG_1506", 0.0, 8.0), ("IMG_1578", 18.0, 10.0),
        ("IMG_1574", 0.0, 10.0),
    ]),
    ("Suv ichayotgan yolg'iz fil", "Allada.mp3", [
        ("IMG_1442", 0.0, 14.0, F), ("IMG_1443", 0.0, 12.0, F), ("IMG_1445", 6.0, 6.0, F), ("IMG_1444", 13.0, 7.0, F),
        ("IMG_1442", 15.0, 8.0, F),
    ]),
    ("Changli yo'lda savanna", "Allada.mp3", [
        ("IMG_1509", 0.0, 10.0), ("IMG_1513", 4.0, 10.0), ("IMG_1571", 0.0, 12.0), ("IMG_1583", 4.0, 8.0),
        ("IMG_1579", 2.0, 8.0),
    ]),
    ("Zebra, impala, gnu, buyvol", "Allada.mp3", [
        ("IMG_1463", 7.0, 5.0), ("IMG_1463", 0.0, 4.0), ("IMG_5909", 0.0, 4.8), ("IMG_1460", 6.0, 8.0),
        ("IMG_1460", 22.0, 8.0), ("IMG_5954", 0.0, 2.7), ("IMG_5955", 0.0, 3.9), ("IMG_5882", 0.0, 4.0),
        ("IMG_1511", 0.0, 8.0),
    ]),
    ("Daraxt tagidagi sherlar", "Lord of the Land.mp3", [
        ("IMG_5834", 0.0, 4.0), ("IMG_1449", 0.0, 5.0), ("IMG_1449", 11.0, 6.0), ("IMG_5836", 0.0, 3.2),
        ("IMG_1449", 6.0, 4.0), ("IMG_5834", 4.0, 9.0), ("IMG_5836", 6.0, 8.0),
    ]),
    ("Jirafalar", "Tafi Maradi no voice.mp3", [
        ("IMG_5890", 0.0, 6.8), ("IMG_1481", 0.0, 9.0), ("IMG_1526", 0.0, 5.6), ("IMG_5964", 0.0, 9.4),
        ("IMG_1481", 11.0, 5.0),
    ]),
    ("Daraxt ustidagi leopard", "Tafi Maradi no voice.mp3", [
        ("IMG_6498", 0.0, 10.0), ("IMG_6499", 0.0, 9.0), ("IMG_6499", 24.0, 7.0),
    ]),
    # The elephant walks up and twice runs towards the jeep (IMG_1569), not a full attack.
    ("Fil mashinaga ikki marta yugurib keldi", "Feral Chase.mp3", [
        ("IMG_5862", 0.0, 11.0), ("IMG_1518", 10.0, 16.0), ("IMG_1517", 0.0, 8.0, F),
        ("IMG_1569", 10.0, 22.0, F), ("IMG_1569", 39.0, 16.0, F), ("IMG_1458", 0.0, 14.0, F),
    ]),
    ("Qaytish va yakun", "Kumasi Groove.mp3", [
        ("IMG_1563", 0.0, 10.0), ("IMG_1559", 20.0, 19.0), ("IMG_1562", 0.0, 10.7), ("IMG_1243", 16.0, 7.0),
    ]),
]

# Opening title (Uzbek), drawn over the first shot.
TITLE = ["ZANZIBAR", "va Afrika safarisi", "Mikumi milliy bog‘i · Tanzaniya"]
