# import matplotlib.pyplot as plt
from collections import OrderedDict
import numpy as np
import json
import math
import glob
import os.path
import copy


def function(x, a, b):
    return a * x + b


def erase_point(x, y):
    r = 2.5
    index = 0
    index2 = 0
    xy_len = 0
    n_x = [x[0]]
    n_y = [y[0]]
    while index2 < len(x):
        x1 = x[index] - x[index2]
        y1 = y[index] - y[index2]
        xy_len = math.sqrt(x1 * x1 + y1 * y1)
        if r <= xy_len:
            n_x.append(x[index2])
            n_y.append(y[index2])
            index = index2
        index2 += 1
    # plt.title("original")
    # plt.scatter(x, y, s=5)
    # plt.figure()
    # plt.title("erase")
    # plt.scatter(n_x, n_y, s=5)
    # plt.figure()
    get_points(n_x, n_y)


def get_points(n_x, n_y):
    for i in range(len(n_x)):
        bi = i - size
        ni = i + size
        if bi < 0:
            bi += len(n_x)
        if ni >= len(n_x):
            ni -= len(n_x)
        x1 = n_x[bi] - n_x[i]
        y1 = n_y[bi] - n_y[i]
        x2 = n_x[ni] - n_x[i]
        y2 = n_y[ni] - n_y[i]
        ang1 = np.arctan2(x1, y1)
        ang2 = np.arctan2(x2, y2)
        res = np.rad2deg((ang1 - ang2) % (2 * np.pi))
        res = (360 - res) % 360
        if n_x[i] != 0 and n_y[i] != 0 and 160 < res < 200:
            point.append(i)
    # plt.title("point")
    # plt.scatter(n_x, n_y, s=5)
    # plt.scatter([n_x[i] for i in point], [n_y[i] for i in point], s=5)
    # plt.figure()
    get_line(n_x, n_y)


def get_line(n_x, n_y):
    temp = [point[0]]
    prev_p = point[0]
    result = []
    for p in point[1:]:
        if abs(prev_p - p) == 1:
            temp.append(p)
        else:
            if len(temp) > 1:
                if abs(n_x[temp[0]] - n_x[temp[-1]]) <= th_hold and \
                        abs(n_x[temp[0]] - n_x[temp[-1]]) < abs(n_y[temp[0]] - n_y[temp[-1]]):
                    avr = round(np.mean([n_x[t] for t in temp]))
                    result.append([avr, 0])
                elif abs(n_y[temp[0]] - n_y[temp[-1]]) <= th_hold and \
                        abs(n_x[temp[0]] - n_x[temp[-1]]) > abs(n_y[temp[0]] - n_y[temp[-1]]):
                    avr = round(np.mean([n_y[t] for t in temp]))
                    result.append([avr, 1])
            temp = [p]
        prev_p = p
    if len(temp) > 1:
        if abs(n_x[temp[0]] - n_x[temp[-1]]) <= th_hold:
            avr = round(np.mean([n_x[t] for t in temp]))
            result.append([avr, 0])
        elif abs(n_y[temp[0]] - n_y[temp[-1]]) <= th_hold:
            avr = round(np.mean([n_y[t] for t in temp]))
            result.append([avr, 1])
    prev_r = result[0]
    temp = [result[0]]
    final = []
    for r in result[1:]:
        if abs(prev_r[0] - r[0]) <= th_hold and prev_r[1] == r[1]:
            temp.append(r)
        else:
            avr = round(np.mean([t[0] for t in temp]))
            final.append([avr, prev_r[1]])
            temp = [r]
        prev_r = r
    avr = round(np.mean([t[0] for t in temp]))
    if abs(avr - final[0][0]) <= th_hold:
        avr = round((avr + final[0][0]) / 2)
        final[0][0] = avr
    final.append([avr, prev_r[1]])
    get_curve(n_x, n_y, final)


def get_curve(n_x, n_y, final):
    n_i = 0
    new_x = []
    new_y = []
    line_p = []
    for f_i in final:
        temp = []
        count = 0
        temp.append(len(new_x))
        while n_i < len(n_x):
            if f_i[1] == 0 and abs(n_x[n_i] - f_i[0]) <= th_hold:
                new_x.append(f_i[0])
                new_y.append(n_y[n_i])
                count += 1
            elif f_i[1] == 1 and abs(n_y[n_i] - f_i[0]) <= th_hold:
                new_x.append(n_x[n_i])
                new_y.append(f_i[0])
                count += 1
            elif count > 2:
                temp.append(len(new_x) - 1)
                line_p.append(temp)
                break
            n_i += 1
    temp.append(len(new_x) - 1)
    line_p.append(temp)
    if final[0] == final[-1]:
        line_p[0][0] = line_p[-1][0]
        line_p.pop()
        final.pop()
    get_result(new_x, new_y, final, line_p)


def get_result(n_x, n_y, final, line_p):
    t_p = []
    l_i = 0
    p_f = final[0]
    for f in final[1:]:
        if f[0] != p_f[0] and f[1] == p_f[1]:
            t_p.append([n_x[line_p[l_i][1]], n_y[line_p[l_i][1]], "b"])
            t_p.append([n_x[line_p[l_i + 1][0]], n_y[line_p[l_i + 1][0]], "b"])
        elif f[1] != p_f[1]:
            if f[1] == 1 and abs(n_y[line_p[l_i][1]] - f[0]) <= 10:
                n_y[line_p[l_i][1]] = f[0]
                t_p.append([n_x[line_p[l_i][1]], n_y[line_p[l_i][1]], "v"])
            elif f[1] == 0 and abs(n_x[line_p[l_i][1]] - f[0]) <= 10:
                n_x[line_p[l_i][1]] = f[0]
                t_p.append([n_x[line_p[l_i][1]], n_y[line_p[l_i][1]], "v"])
            else:
                t_p.append([n_x[line_p[l_i][1]], n_y[line_p[l_i][1]], "b"])
                t_p.append([n_x[line_p[l_i + 1][0]], n_y[line_p[l_i + 1][0]], "b"])
        l_i += 1
        p_f = f
    if final[0][0] != p_f[0] and final[0][1] == p_f[1] != 2:
        t_p.append([n_x[line_p[l_i][1]], n_y[line_p[l_i][1]], "b"])
        t_p.append([n_x[line_p[0][0]], n_y[line_p[0][0]], "b"])
    elif final[0][1] != p_f[1] and final[0][1] != 2 and p_f[1] != 2:
        if final[0][1] == 1 and abs(n_y[line_p[l_i][1]] - final[0][0]) <= 10:
            n_y[line_p[l_i][1]] = final[0][0]
            t_p.append([n_x[line_p[l_i][1]], n_y[line_p[l_i][1]], "v"])
        elif final[0][1] == 0 and abs(n_x[line_p[l_i][1]] - final[0][0]) <= 10:
            n_x[line_p[l_i][1]] = final[0][0]
            t_p.append([n_x[line_p[l_i][1]], n_y[line_p[l_i][1]], "v"])
        else:
            t_p.append([n_x[line_p[l_i][1]], n_y[line_p[l_i][1]], "b"])
            t_p.append([n_x[line_p[0][0]], n_y[line_p[0][0]], "b"])
    n_x, n_y = padding(n_x, n_y)
    if total_v:
        bs = 0
        for t1 in total_v[-1]:
            for t2 in t_p:
                if t1[2] == t2[2] == "v" and abs(t1[0] - t2[0]) < 10 and abs(t1[1] - t2[1]) < 10:
                    for i in range(len(n_x)):
                        n_x[i] += t1[0] - t2[0]
                        n_y[i] += t1[1] - t2[1]
                    bs = 1
                    break
            if bs == 1:
                break
    total_v.append(t_p)
    total_plt.append([n_x, n_y])
    total_p.append(t_p)
    for i in range(len(t_p)):
        if t_p[i][2] == "b":
            if len(map_X) == 0:
                broken_point_x.append(t_p[i][0])
                broken_point_y.append(t_p[i][1])
            else:
                for j in range(len(map_X)):
                    if abs(t_p[i][0] - map_X[j]) > 5 and abs(t_p[i][1] - map_Y[j]) > 5:
                        broken_point_x.append(t_p[i][0])
                        broken_point_y.append(t_p[i][1])
    # plt.title("final")
    # plt.scatter(n_x, n_y, s=5)
    # plt.scatter([t[0] for t in t_p if t[2] == "b"], [t[1] for t in t_p if t[2] == "b"], s=10)
    # plt.scatter([t[0] for t in t_p if t[2] == "v"], [t[1] for t in t_p if t[2] == "v"], s=10, c="black")
    # plt.show()


def padding(n_x, n_y):
    new_x = [n_x[0]]
    new_y = [n_y[0]]
    for x, y in zip(n_x[1:], n_y[1:]):
        if new_x[-1] == x:
            if new_y[-1] - y >= 1:
                for i in range(abs(new_y[-1] - y)):
                    new_x.append(x)
                    new_y.append(new_y[-1] - 1)
            else:
                for i in range(abs(new_y[-1] - y)):
                    new_x.append(x)
                    new_y.append(new_y[-1] + 1)
        elif new_y[-1] == y:
            if new_x[-1] - x >= 1:
                for i in range(abs(new_x[-1] - x)):
                    new_x.append(new_x[-1] - 1)
                    new_y.append(y)
            else:
                for i in range(abs(new_x[-1] - x)):
                    new_x.append(new_x[-1] + 1)
                    new_y.append(y)
        else:
            new_x.append(x)
            new_y.append(y)
            continue
    if new_x[-1] == new_x[0]:
        if new_y[-1] - new_y[0] >= 1:
            for i in range(abs(new_y[-1] - new_y[0])):
                new_x.append(new_x[0])
                new_y.append(new_y[-1] - 1)
        else:
            for i in range(abs(new_y[-1] - new_y[0])):
                new_x.append(new_x[0])
                new_y.append(new_y[-1] + 1)
    elif new_y[-1] == y:
        if new_x[-1] - x >= 1:
            for i in range(abs(new_x[-1] - new_x[0])):
                new_x.append(new_x[-1] - 1)
                new_y.append(new_y[0])
        else:
            for i in range(abs(new_x[-1] - new_x[0])):
                new_x.append(new_x[-1] + 1)
                new_y.append(new_y[0])
    return new_x, new_y


def get_len(x1, y1, x2, y2):
    return round(math.sqrt(math.pow(x1 - x2, 2) + math.pow(y1 - y2, 2)))


def merge():
    x1, y1 = padding(total_plt[0][0], total_plt[0][1])
    x2, y2 = padding(total_plt[1][0], total_plt[1][1])
    all_r.append([x2, y2])
    print(len(x1))
    print(len(x2))
    # plt.title("b merge")
    # plt.scatter(x1, y1, s=5)
    # plt.scatter(x2, y2, s=5)
    # plt.figure()
    result = [[x1[0]], [y1[0]]]
    len_p = 0
    for x11, y11 in zip(x1[1:], y1[1:]):
        len_p = get_len(result[0][-1], result[1][-1], x11, y11)
        if len_p <= 5:
            result[0].append(x11)
            result[1].append(y11)
        else:
            for x22, y22 in zip(x2, y2):
                len_p = get_len(result[0][-1], result[1][-1], x22, y22)
                if get_len(x11, y11, x22, y22) <= 1:
                    result[0].append(x11)
                    result[1].append(y11)
                    break
                elif len_p <= 5:
                    result[0].append(x22)
                    result[1].append(y22)
    print(len(result[0]))
    # plt.title("a merge")
    # plt.scatter(result[0], result[1], s=5)
    # # plt.plot(result[0], result[1])
    # plt.show()
    return result


def round_p():
    round_x = []
    round_y = []
    for x, y in zip(X, Y):
        rad = (-1.5) * (math.pi / 180.0)
        round_x.append(machine[0] + round(math.cos(rad) * (x - machine[0]) - math.sin(rad) * (y - machine[1])))
        round_y.append(machine[1] + round(math.sin(rad) * (x - machine[0]) + math.cos(rad) * (y - machine[1])))
    return round_x, round_y


############### detect road ##################

file_path = "./html/final.json"
map_path = "./html/map.json"
map_X = []
map_Y = []

point = []
X = []
Y = []
machine = []
total_plt = []
total_p = []
th = []
th_hold = 3
size = 1
c = 0
all_r = []

with open(map_path, 'r') as f:
    data = json.load(f)
    X = data["Map_x"]
    Y = data["Map_y"]
th = []
point = []
v = [0 for i in range(len(map_X))]
v[0] = 1
r_x = [map_X[0]]
r_y = [map_Y[0]]
while len(r_x) != len(map_X):
    for k in range(1, len(map_X)):
        len1 = round(math.sqrt(math.pow(map_X[k] - r_x[-1], 2) + math.pow(map_Y[k] - r_y[-1], 2)))
        if len1 <= 8 and v[k] == 0:
            r_x.append(map_X[k])
            r_y.append(map_Y[k])
            v[k] = 1
get_points(r_x, r_y)
r_x, r_y = padding(r_x, r_y)

file_data = OrderedDict()

file_data["Map_x"] = r_x
file_data["Map_y"] = r_y

with open(file_path, 'w', encoding="utf-8") as make_file:
    json.dump(file_data, make_file, ensure_ascii=False, indent="\t")
