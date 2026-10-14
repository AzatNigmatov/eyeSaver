const canvas = document.getElementById('screen') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

function resize(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
