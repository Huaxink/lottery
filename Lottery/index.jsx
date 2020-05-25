import React, { PureComponent } from 'react';
import './index.less';

// 彩票走势图
function rnd(n, m) {
    return parseInt(Math.random() * (m - n) + n);
}

function findArr(n, arr) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === n) {
            return true;
        }
    }
    return false;
}

// 双色球中奖算法
function getRoundNumber(n) {
    const arr = [];
    while (arr.length < n) {
        const a = rnd(1, 34);
        if (!findArr(a, arr)) {
            arr.push(a);
        }
    }
    return arr
};

function getCellClass(item) {
    let cellClass = 'cell';
    if (item.has_top) {
        cellClass += ' cell-top-line';
    }
    if (item.has_right) {
        cellClass += ' cell-right-line';
    }
    if (item.has_left) {
        cellClass += ' cell-left-line';
    }
    if (item.has_select) {
        cellClass += ' cell-select';
    }
    return cellClass;
}

class Lottery extends PureComponent {
    constructor(props) {
        super(props);
        const allMainNumbers = []; // 渲染表头
        const mainData = []; // 渲染表哥
        const groupLineIds = []; // 画线的canvas
        const selectCellIds = []; // 高亮的中奖号码单元格
        for (let k = 0; k < 6; k++) {
            groupLineIds[k] = [];
        }
        for (let i = 0; i < 6; i++) {
            allMainNumbers[i] = [];
            for (let j = 1; j < 34; j++) {
                allMainNumbers[i].push(j);
            }
        }
        for (let i = 1; i < 41; i++) {
            const numbers = getRoundNumber(6); // 每期中奖号码
            const cells = []; // 格子
            allMainNumbers.forEach((innerNums, key) => {
                const rewiredNum = numbers[key];
                innerNums.forEach((v) => {
                    const cell = {
                        x: v,
                        y: i,
                        v,
                        has_top: (i - 1) % 5 === 0,
                        has_right: (key + v >= 33) && (v % 33 === 0),
                        has_left: key === 0 && v === 1,
                        has_select: rewiredNum === v,
                        id: `flotteCellId_${key}_${v}_${i}`
                    };
                    if (cell.has_select) {
                        selectCellIds.push({ id: cell.id, v: cell.v });
                    }
                    cells.push(cell);
                });
            })
            const data = {
                title: `2015${i < 10 ? ('0' + i) : i}`,
                numbers,
                cells
            };
            mainData.push(data);
        }

        // 获取画线的id
        selectCellIds.forEach((v, i) => {
            const index = i % 6;
            groupLineIds[index].push(v);
        });

        this.state = {
            allMainNumbers,
            mainData,
            selectCellIds,
            groupLineIds
        };
    }

    renderSelectCell() {
        const { selectCellIds } = this.state;
        const container = document.querySelector('.lottery');
        const { top, left } = container.getBoundingClientRect();
        for (let i = 0, n = selectCellIds.length; i < n; i++) {
            const { id, v } = selectCellIds[i];
            const selectDiv = document.querySelector(`#${id}`);
            const div = document.createElement('div');
            const x = selectDiv.getBoundingClientRect().left - left;
            const y = selectDiv.getBoundingClientRect().top - top;
            div.classList.add('lottery-select');
            div.style.top = `${y}px`;
            div.style.left = `${x}px`;
            div.innerHTML = v;
            container.appendChild(div);
        }
    }

    renderLine() {
        const { groupLineIds } = this.state;
        const container = document.querySelector('.lottery');
        const { top, left } = container.getBoundingClientRect();
        for (let i = groupLineIds.length - 1; i >= 0; i--) {
            const lineList = groupLineIds[i];
            for (let j = lineList.length - 1; j > 0; j--) {
                const target = lineList[j];
                const from = lineList[j - 1];
                const t = document.querySelector(`#${target.id}`);
                const f = document.querySelector(`#${from.id}`);
                const f_left = f.getBoundingClientRect().left;
                const t_left = t.getBoundingClientRect().left;
                const f_top = f.getBoundingClientRect().top;
                const t_top = t.getBoundingClientRect().top;
                const canvasW = Math.abs(f_left - t_left);
                const canvasH = Math.abs(f_top - t_top);
                const csv_left = Math.min(f_left, t_left);
                const csv_top = Math.min(f_top, t_top);
                const canvasTop = csv_top - top;
                const canvasLeft = csv_left - left;
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = canvasW <= 0 ? 10 : canvasW;
                canvas.height = canvasH;
                canvas.style.top = `${canvasTop + 10}px`;
                canvas.style.left = `${canvasLeft + 10}px`;
                canvas.style.position = 'absolute';
                canvas.style.zIndex = 2;
                ctx.save();
                ctx.strokeStyle = '#fa8c16';
                ctx.lineWidth = 2;
                ctx.lineJoin = 'round';
                ctx.beginPath();
                ctx.moveTo(f_left - csv_left, f_top - csv_top);
                ctx.lineTo(t_left - csv_left, t_top - csv_top);
                ctx.closePath();
                ctx.stroke();
                ctx.restore();
                container.appendChild(canvas);
            }
        }
    }

    componentDidMount() {
        this.renderSelectCell();
        this.renderLine();
    }

    render() {
        const { allMainNumbers, mainData } = this.state;
        return (
            <div className="lottery">
                <div className="head">
                    <div className="first-cloumn">期号</div>
                    {
                        allMainNumbers.map((item, idx) => (
                            item.map((v) => (
                                <div className="t-head" key={`${idx}_${v}`}>
                                    {v}
                                </div>
                            ))
                        ))
                    }
                </div>
                <div className="number-order">
                    {
                        mainData.map((item, idx) => (
                            <div className="row" key={idx}>
                                <div className="row-t">{item.title}</div>
                                {
                                    item.cells.map((cell, i) => (
                                        <div className={getCellClass(cell)} key={i} id={cell.id}>
                                            <div className="number">{cell.v}</div>
                                        </div>
                                    ))
                                }
                            </div>
                        ))
                    }
                </div>
            </div>
        );
    }
}

export default Lottery;
