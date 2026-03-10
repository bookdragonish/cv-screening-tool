import { spawn } from 'child_process';
import { existsSync } from 'fs';

export function convertCvToMarkdown(pdfPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!existsSync(pdfPath)) {
            reject(new Error('File does not exist'));
            return;
        }
        
        const pythonProcess = spawn('python', ['src/middleware/cvToMarkdown.py', pdfPath]);

        let output = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.on('close', () => {
            resolve(output);
        });
    });
}