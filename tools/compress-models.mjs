#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readdir, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

const pExecFile = promisify(execFile);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

function usage() {
  console.log('Usage: node tools/compress-models.mjs <inputDir?> <outputDir?>');
  console.log('Defaults: input=client/public/models, output=client/public/models-compressed');
}

async function main() {
  const inputDir = process.argv[2] || path.resolve('client/public/models');
  const outputDir = process.argv[3] || path.resolve('client/public/models-compressed');

  try {
    await mkdir(outputDir, { recursive: true });
  } catch {}

  try {
    await stat(inputDir);
  } catch (e) {
    console.error(`Input directory not found: ${inputDir}`);
    usage();
    process.exit(1);
  }

  const files = [];
  for await (const f of walk(inputDir)) {
    if (f.toLowerCase().endsWith('.glb') || f.toLowerCase().endsWith('.gltf')) {
      files.push(f);
    }
  }

  if (files.length === 0) {
    console.log('No .glb/.gltf files found under', inputDir);
    return;
  }

  console.log(`Found ${files.length} model(s). Compressing with gltfpack...`);
  for (const infile of files) {
    const rel = path.relative(inputDir, infile);
    const outPath = path.join(outputDir, rel).replace(/\.(glb|gltf)$/i, '.glb');
    await mkdir(path.dirname(outPath), { recursive: true });

    try {
      // Use npx to invoke gltfpack without a local install
      const args = ['gltfpack', '-i', infile, '-o', outPath, '-cc', '-tc'];
      console.log('> npx', args.join(' '));
      const { stdout, stderr } = await pExecFile(process.platform === 'win32' ? 'npx.cmd' : 'npx', args, {
        windowsHide: true,
        maxBuffer: 10 * 1024 * 1024,
      });
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
    } catch (e) {
      console.error('Compression failed for', infile, e?.message || e);
    }
  }

  console.log('Done. Compressed models written to', outputDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
