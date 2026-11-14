const fs = require('fs');
const path = require('path');

const rollupNativePath = path.join(__dirname, '..', 'node_modules', 'rollup', 'dist', 'native.js');

if (fs.existsSync(rollupNativePath)) {
  let content = fs.readFileSync(rollupNativePath, 'utf8');
  if (!content.includes('@rollup/wasm-node')) {
    content = content.replace(
      'const nativeModule = requireWithFriendlyError(',
      'let nativeModule;\ntry {\n\tnativeModule = requireWithFriendlyError('
    );
    content = content.replace(
      ');\n\nconst { parse, parseAsync',
      ');\n} catch (err) {\n\ttry {\n\t\tnativeModule = require(\'@rollup/wasm-node/dist/native.js\');\n\t} catch (wasmErr) {\n\t\tthrow err;\n\t}\n}\n\nconst { parse, parseAsync'
    );
    fs.writeFileSync(rollupNativePath, content, 'utf8');
    console.log('[BizPilot] Rollup WebAssembly fallback patched successfully.');
  }
}
