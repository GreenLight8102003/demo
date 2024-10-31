class MazeSolver {
    constructor(size) {
        this.size = size;
        this.maze = Array(size).fill().map(() => Array(size).fill(0));
        this.start = null;
        this.end = null;
        this.visited = Array(size).fill().map(() => Array(size).fill(false));
        this.path = [];
        this.steps = [];
        this.isSelectingStart = false;
        this.isSelectingEnd = false;
    }

    createMazeGrid() {
        const mazeElement = document.getElementById('maze');
        mazeElement.innerHTML = '';
        mazeElement.style.gridTemplateColumns = `repeat(${this.size}, 50px)`;

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;

                // Thêm sự kiện click để toggle 0/1
                cell.addEventListener('click', () => {
                    if (this.isSelectingStart) {
                        this.setStart(i, j);
                    } else if (this.isSelectingEnd) {
                        this.setEnd(i, j);
                    } else {
                        this.toggleCell(i, j);
                    }
                });

                mazeElement.appendChild(cell);
            }
        }
        this.updateDisplay();
    }

    toggleCell(i, j) {
        if (this.start && i === this.start[0] && j === this.start[1]) return;
        if (this.end && i === this.end[0] && j === this.end[1]) return;
        
        this.maze[i][j] = 1 - this.maze[i][j];
        this.updateDisplay();
    }

    setStart(i, j) {
        if (this.maze[i][j] === 1) return;
        if (this.end && i === this.end[0] && j === this.end[1]) return;
        
        this.start = [i, j];
        this.isSelectingStart = false;
        document.body.classList.remove('selecting-start');
        this.updateDisplay();
    }

    setEnd(i, j) {
        if (this.maze[i][j] === 1) return;
        if (this.start && i === this.start[0] && j === this.start[1]) return;
        
        this.end = [i, j];
        this.isSelectingEnd = false;
        document.body.classList.remove('selecting-end');
        this.updateDisplay();
    }

    updateDisplay() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const i = parseInt(cell.dataset.row);
            const j = parseInt(cell.dataset.col);
            
            cell.className = 'cell';
            
            // Hiển thị giá trị và màu sắc
            if (this.maze[i][j] === 1) {
                cell.classList.add('wall');
            }
            
            // Hiển thị đường đi
            if (this.path.some(([x, y]) => x === i && y === j)) {
                cell.classList.add('path');
            }
            
            // Hiển thị điểm bắt đầu và kết thúc
            if (this.start && i === this.start[0] && j === this.start[1]) {
                cell.classList.add('start');
            }
            if (this.end && i === this.end[0] && j === this.end[1]) {
                cell.classList.add('end');
            }
        });

        // Hiển thị các bước
        const stepsElement = document.getElementById('steps');
        stepsElement.innerHTML = this.steps
            .map(step => `<div class="step">${step}</div>`)
            .join('');
        stepsElement.scrollTop = stepsElement.scrollHeight;
    }

    findPath(x, y) {
        // Tạo delay để có thể thấy từng bước
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        // Hàm đệ quy với async/await để tạo animation
        async function findPathWithAnimation(x, y) {
            // BƯỚC 1: ĐIỀU KIỆN DỪNG
            if (x < 0 || x >= this.size || y < 0 || y >= this.size || 
                this.maze[x][y] === 1 || this.visited[x][y]) {
                this.steps.push(`❌ Không thể đi đến ô (${x}, ${y}): 
                    ${x < 0 || x >= this.size || y < 0 || y >= this.size ? 'Ra ngoài mê cung' : 
                     this.maze[x][y] === 1 ? 'Gặp tường' : 'Đã đi qua'}`);
                await delay(130);
                this.updateDisplay();
                return false;
            }

            // BƯỚC 2: ĐÁNH DẤU Ô HIỆN TẠI
            this.visited[x][y] = true;
            this.path.push([x, y]);
            this.steps.push(`🔍 Đang xét ô (${x}, ${y})`);
            await delay(130);
            this.updateDisplay();

            // BƯỚC 3: KIỂM TRA ĐÍCH
            if (x === this.end[0] && y === this.end[1]) {
                this.steps.push(`🎯 Đã tìm thấy đích tại (${x}, ${y})!`);
                await delay(130);
                this.updateDisplay();
                return true;
            }

            // BƯỚC 4: THỬ CÁC HƯỚNG
            const directions = [
                [0, 1, "→ phải"],
                [1, 0, "↓ xuống"],
                [0, -1, "← trái"],
                [-1, 0, "↑ lên"]
            ];

            for (const [dx, dy, direction] of directions) {
                const newX = x + dx;
                const newY = y + dy;
                
                this.steps.push(`🔄 Thử đi ${direction} từ (${x}, ${y}) đến (${newX}, ${newY})`);
                await delay(130);
                this.updateDisplay();

                if (await findPathWithAnimation.call(this, newX, newY)) {
                    this.steps.push(`✅ Tìm thấy đường đi qua (${x}, ${y})`);
                    await delay(130);
                    this.updateDisplay();
                    return true;
                }
            }

            // BƯỚC 5: QUAY LUI
            this.path.pop();
            this.steps.push(`⬅️ Quay lui từ ô (${x}, ${y})`);
            await delay(130);
            this.updateDisplay();
            return false;
        }

        // Gọi hàm với animation
        return findPathWithAnimation.call(this, x, y);
    }

    solve() {
        if (!this.start || !this.end) {
            alert('Vui lòng đặt điểm bắt đầu và điểm kết thúc!');
            return false;
        }

        // Reset lại các biến trước khi tìm đường mới
        this.visited = Array(this.size).fill().map(() => Array(this.size).fill(false));
        this.path = [];
        this.steps = [];

        const result = this.findPath(this.start[0], this.start[1]);
        
        if (result) {
            this.steps.push('Đã tìm thấy đường đi!');
        } else {
            this.steps.push('Không tìm thấy đường đi!');
        }
        
        this.updateDisplay();
        this.displaySteps();
        return result;
    }

    displaySteps() {
        const stepsElement = document.getElementById('steps');
        stepsElement.textContent = this.steps.join('\n');
    }
}

// Khởi tạo biến toàn cục để lưu trữ instance của MazeSolver
let mazeSolver;

document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo với kích thước mặc định
    mazeSolver = new MazeSolver(5);
    mazeSolver.createMazeGrid();

    document.getElementById('createMaze').addEventListener('click', () => {
        const size = parseInt(document.getElementById('mazeSize').value);
        mazeSolver = new MazeSolver(size);
        mazeSolver.createMazeGrid();
    });

    document.getElementById('setStart').addEventListener('click', () => {
        mazeSolver.isSelectingStart = true;
        mazeSolver.isSelectingEnd = false;
        document.body.classList.add('selecting-start');
        document.body.classList.remove('selecting-end');
    });

    document.getElementById('setEnd').addEventListener('click', () => {
        mazeSolver.isSelectingEnd = true;
        mazeSolver.isSelectingStart = false;
        document.body.classList.add('selecting-end');
        document.body.classList.remove('selecting-start');
    });

    document.getElementById('solveMaze').addEventListener('click', () => {
        mazeSolver.solve();
    });

    document.getElementById('resetMaze').addEventListener('click', () => {
        location.reload();
    });
});
