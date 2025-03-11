import json
import os.path as os


replace_list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 31, 32, 33, 34, 35, 36, 37,
38, 44, 45, 47, 48, 49, 53, 54, 55, 56, 57, 58, 59, 60, 66, 67, 69, 70, 71, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 88,
89, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 132, 133, 135, 140, 145, 150, 154, 155, 160, 165, 170, 175, 176,
177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 307, 308, 309, 310, 311, 312, 313, 314,
315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 329, 337, 338, 339, 340, 341, 342, 343, 344, 351, 353, 354, 355, 359, 360, 361, 362,
363, 364, 365, 366, 373, 375, 376, 377, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 395, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412,
413, 414, 415, 417, 439, 441, 446, 451, 456, 461, 466, 471, 476, 481, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 495, 496, 497, 498,
499, 500, 501, 502, 503, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529,
530, 531, 532, 533, 534, 535, 536, 537, 538, 539, 540, 541, 542, 543, 544, 545, 546, 547, 548, 549, 550, 551, 552, 553, 554, 555, 556, 557, 558, 559,
560, 561, 562, 563, 564, 565, 566, 567, 568, 569, 570, 571, 572, 573, 574, 575, 576, 577, 578, 579, 580, 581, 582, 583, 584, 585, 586, 587, 588, 589,
590, 591, 592, 593, 594, 595, 596, 597, 598, 599, 600, 601, 602, 603, 604, 605, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615, 616, 617, 618, 619,
620, 621, 622, 623, 624, 625, 626, 627, 628, 629, 630, 631, 632, 633, 634, 635, 636, 637, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649,
650, 651, 652, 653, 654, 655, 656, 657, 658, 659, 660, 661, 662, 663, 664, 665, 666, 667, 668, 669, 670, 671, 672, 673, 674, 675, 676, 677, 685, 686,
687, 688, 689, 690, 691, 692, 698, 699, 701, 702, 703, 707, 708, 709, 710, 711, 712, 713, 714, 720, 721, 723, 724, 725, 731, 732, 733, 734, 735, 736,
742, 743, 753, 754, 755, 756, 757, 758, 759, 760, 761, 762, 763, 764, 765, 786, 787, 789, 794, 799, 804, 808, 809, 814, 819, 824, 829, 830, 831, 832,
833, 834, 835, 836, 837, 838, 839, 840, 841, 842, 843, 844, 845, 846, 847, 848, 849, 850, 851, 852, 853, 854, 855, 856, 857, 858, 859, 860, 861, 867,
868, 869, 871, 875, 876, 877, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898, 899, 900, 901, 902, 903, 904,
905, 906, 907, 908, 909, 910, 911, 912, 913, 914, 915, 923, 924, 925, 926, 927, 928, 929, 930, 936, 937, 939, 940, 941, 945, 946, 947, 948, 949, 950,
951, 952, 958, 959, 961, 962, 963, 965, 966, 967, 968, 969, 970, 971, 972, 973, 974, 980, 981, 988, 989, 990, 991, 992, 993, 994, 995, 996, 997, 998,
999, 1000, 1001, 1002, 1003, 1024, 1025, 1027, 1032, 1037, 1042, 1046, 1047, 1052, 1057, 1062, 1067, 1068, 1069, 1070, 1071, 1072, 1073, 1074, 1075, 1076, 1077, 1078, 1079, 1080,
1081, 1082, 1083, 1084, 1085, 1086, 1087, 1088, 1089, 1090, 1097, 1099, 1100, 1102, 1103, 1104, 1109, 1117, 1118, 1125, 1127, 1128, 1130, 1131, 1132, 1133, 1134, 1135, 1143, 1146,
1150, 1151, 1152, 1153, 1154, 1155, 1156, 1157, 1158, 1159, 1160, 1164, 1165, 1166, 1173, 1174, 1211, 1212, 1213, 1217, 1218, 1219, 1220, 1221, 1222, 1225, 1226, 1227, 1228, 1229,
1230, 1231, 1232, 1233, 1234, 1235, 1236, 1239, 1240, 1241, 1243, 1245, 1246, 1247, 1248, 1249, 1250, 1251, 1252, 1253, 1254, 1255, 1256, 1257, 1258, 1259, 1260, 1261, 1262, 1264,
1266, 1268, 1269, 1271, 1274, 1275, 1276, 1277, 1278, 1279, 1280, 1281, 1282, 1283, 1284, 1285, 1286, 1287, 1288, 1289, 1290, 1291, 1292, 1293, 1294, 1295, 1296, 1297, 1299, 1301,
1302, 1303, 1304, 1305, 1306, 1307, 1308, 1309, 1310, 1311, 1312, 1313, 1314, 1315, 1316, 1317, 1318, 1319, 1320, 1321, 1322, 1323, 1324, 1325, 1326, 1327, 1328, 1329, 1330, 1331,
1332, 1333, 1334, 1335, 1336, 1337, 1338, 1339, 1340, 1341, 1342, 1343, 1344, 1345, 1346, 1347, 1348, 1349, 1350, 1351, 1352, 1353, 1354, 1355, 1356, 1357, 1358, 1359, 1360, 1361,
1362, 1363, 1364, 1365, 1366, 1367, 1368, 1369, 1370, 1371, 1372, 1373, 1374, 1375, 1376, 1377, 1378, 1379, 1380, 1381, 1382, 1383, 1384, 1385, 1386, 1387, 1388, 1389, 1390, 1391,
1392, 1393, 1394, 1395, 1396, 1397, 1398, 1399, 1400, 1401, 1402, 1403, 1404, 1405, 1406, 1407, 1408, 1409, 1410, 1425, 1426, 1435, 1436, 1453, 1454, 1457, 1458, 1461, 1462, 1463,
1464, 1467, 1468, 1470, 1471, 1472, 1473, 1485, 1486, 1489, 1490, 1493, 1494, 1495, 1496, 1499, 1500, 1502, 1503, 1504, 1505, 1518, 1522, 1526, 1527, 1528, 1532, 1534, 1535, 1536,
1537, 1566, 1567, 1568, 1569, 1581, 1582, 1585, 1586, 1589, 1590, 1591, 1592, 1599, 1600, 1601, 1613, 1614, 1617, 1618, 1621, 1622, 1623, 1624, 1627, 1628, 1646, 1649, 1650, 1654,
1655, 1656, 1659, 1660, 1663, 1664, 1681, 1682, 1691, 1692, 1695, 1696, 1709, 1710, 1714, 1717, 1718, 1724, 1728, 1741, 1742, 1749, 1750, 1753, 1754, 1774, 1777, 1778, 1781, 1782,
1785, 1786, 1809, 1810, 1813, 1814, 1817, 1818, 1821, 1822, 1837, 1838, 1842, 1846, 1849, 1850, 1853, 1854, 1869, 1870, 1881, 1882, 1885, 1886, 1902, 1905, 1906, 1909, 1910, 1914,
1918, 1937, 1938, 1941, 1942, 1945, 1946, 1947, 1948, 1949, 1950, 1970, 1974, 1977, 1978, 1979, 1980, 1981, 1982, 1997, 1998, 2001, 2002, 2009, 2010, 2011, 2012, 2013, 2014, 2030,
2033, 2034, 2037, 2038, 2041, 2042, 2043, 2044, 2045, 2046, 2065, 2066, 2069, 2070, 2073, 2074, 2075, 2076, 2077, 2078, 2093, 2094, 2098, 2102, 2105, 2106, 2107, 2108, 2109, 2110,
2125, 2126, 2141, 2142, 2143, 2144, 2158, 2173, 2174, 2175, 2176, 2205, 2206, 2207, 2208, 2238, 2239, 2240, 2243, 2244, 2245, 2246, 2275, 2276, 2277, 2278, 2307, 2308, 2309, 2310,
2340, 2341, 2342, 2371, 2372, 2373, 2374, 2375, 2376, 2377, 2378, 2379, 2380, 2381, 2382, 2385, 2386, 2387, 2388, 2389, 2390, 2404, 2406, 2408, 2410, 2412, 2414, 2418, 2420, 2422,
2435, 2436, 2437, 2438, 2439, 2440, 2441, 2442, 2445, 2447, 2449, 2450, 2451, 2452, 2453, 2461, 2462, 2463, 2464, 2465, 2466, 2467, 2473, 2474, 2475, 2483, 2484, 2485, 2486, 2487,
2488, 2489, 2494, 2495, 2496, 2497, 2498, 2499, 2500, 2505, 2506, 2507, 2508, 2509, 2510, 2511, 2512, 2513, 2514, 2515, 2516, 2517, 2518, 2519, 2520, 2521, 2522, 2524, 2525, 2534,
2538, 2539, 2541, 2542, 2546, 2547, 2548, 2549, 2550, 2552, 2553, 2556, 2560, 2561, 2562, 2563, 2566, 2567, 2568, 2569, 2570, 2571, 2572, 2573, 2574, 2575, 2576, 2577, 2578, 2579,
2580, 2581, 2588, 2589, 2590, 2591, 2593, 2594, 2595, 2605, 2606, 2607, 2608, 2609, 2610, 2611, 2612, 2613, 2614, 2615, 2616, 2617, 2618, 2619, 2620, 2621, 2622, 2623, 2624, 2625,
2626, 2627, 2628, 2629, 2630, 2631, 2632, 2633, 2634, 2635, 2636, 2637, 2638, 2639, 2640, 2641, 2642, 2643, 2644, 2645, 2647, 2648, 2649, 2650, 2651, 2652, 2653, 2654, 2655, 2656,
2657, 2658, 2659, 2661, 2664, 2665, 2666, 2667, 2668, 2669, 2670, 2671, 2672, 2673, 2674, 2675, 2676, 2677, 2678, 2679, 2680, 2681, 2682, 2683, 2684, 2685, 2686, 2687, 2688, 2689,
2690, 2691, 2692, 2693, 2694, 2695, 2696, 2697, 2698, 2699, 2700, 2701, 2702, 2703, 2704, 2705, 2706, 2707, 2708, 2709, 2710, 2711, 2712, 2713, 2714, 2715, 2716, 2717, 2718, 2719,
2720, 2721, 2725, 2726, 2727, 2728, 2729, 2730, 2731, 2732, 2733, 2734, 2735, 2736, 2737, 2738, 2743, 2744, 2745, 2746, 2747, 2748, 2752, 2753, 2754, 2755, 2766, 2780, 2781, 2782,
2797, 2798, 2799, 2815, 2845, 2846, 2847, 2848, 2849, 2850, 2851, 2852, 2853, 2854, 2855, 2885, 2886, 2887, 2898, 2902, 2903, 2904, 2920, 3031, 3032, 3033, 3034, 3035, 3036, 3037,
3038, 3039, 3040, 3041, 3042, 3043, 3044, 3045, 3046, 3047, 3048, 3049, 3050, 3051, 3052, 3053, 3054, 3055, 3056, 3057, 3058, 3059, 3060, 3061, 3062, 3063, 3064, 3065, 3066, 3067,
3068, 3069, 3070, 3072, 3073, 3074, 3076, 3077, 3078, 3079, 3080, 3081, 3082, 3083, 3084, 3085, 3086, 3087, 3088, 3089, 3090, 3091, 3092, 3093, 3094, 3095, 3096, 3097, 3098, 3099,
3100, 3101, 3102, 3103, 3104, 3105, 3106, 3107, 3108, 3109, 3110, 3111, 3112, 3113, 3114, 3115, 3116, 3117, 3118, 3120, 3121, 3122, 3124, 3125, 3126, 3131, 3132, 3133, 3134, 3135,
3136, 3137, 3138, 3139, 3140, 3141, 3146, 3147, 3148, 3149, 3150, 3151, 3152, 3153, 3154, 3155, 3156, 3161, 3162, 3163, 3165, 3167, 3169, 3171, 3172, 3173, 3174, 3175, 3176, 3177,
3178, 3183, 3184, 3185, 3186, 3190, 3191, 3192, 3193, 3198, 3199, 3200, 3201, 3202, 3203, 3204, 3205, 3206, 3207, 3208, 3209, 3210, 3211, 3212, 3213, 3214, 3215, 3216, 3220, 3221,
3222, 3223, 3224, 3225, 3226, 3227, 3228, 3229, 3230, 3231, 3232, 3233, 3234, 3235, 3236, 3237, 3238, 3239, 3240, 3241, 3242, 3243, 3244, 3245, 3246, 3247, 3248, 3249, 3250, 3251,
3252, 3253, 3254, 3255, 3256, 3257, 3258, 3259, 3260, 3261, 3262, 3263, 3264, 3265, 3266, 3267, 3268, 3269, 3270, 3271, 3272, 3273, 3274, 3275, 3276, 3277, 3278, 3279, 3280, 3281,
3282, 3283, 3284, 3285, 3286, 3287, 3288, 3289, 3290, 3291, 3292, 3293, 3294, 3295, 3296, 3297, 3298, 3299, 3300, 3301, 3302, 3303, 3304, 3305, 3306,
]

def _replace_values(json_data, replace_list):
    json_data = [
        0 if value in replace_list else value for value in json_data]
    return json_data

# удаляет из коллизий лишние части
def remove(src):

    with open(src, 'r', encoding='utf-8') as f:
        json_data = json.load(f)
    arr = [0 for _ in range(len(json_data["layers"][0]["data"]))]

    for i in json_data["layers"]:
        # if i["name"] not in ["Ground", "Visiable"]:
        updated_data = _replace_values(i["data"], replace_list)
        try:
            for i in range(len(updated_data)):
                if updated_data[i] != 0:
                    arr[i] = [updated_data[i]]
        except:
            pass

    arr = {"object": arr}

    with open(src, 'w', encoding='utf-8') as f:
        json.dump(arr, f, ensure_ascii=False)


def unique(col, file = os.basename(__file__)):
    with open(file,'r') as f:
        info = f.read().split('\n')

    f = False
    rpl = []
    c = 0
    for i in info:
        if ("replace_list = [" in i or f) and c!=1:
            f = True
            if ']' in i:
                rpl.append('')
                c+=1
                f = False
            continue
        rpl.append(i)

    with open(file,'w') as f:
        for i in range(len(rpl)):
            if i == 4:
                new_list = list(set(replace_list))
                x = len(new_list)
                f.writelines('replace_list = [')
                f.writelines([str(new_list[i: i+col]).replace('[', '').replace(']', ',') + "\n" for i in range(0, x, col)])
                f.writelines(']')
            f.write(rpl[i]+'\n')


unique(30)
# remove('')







