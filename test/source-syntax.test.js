import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import process from 'node:process';

const root=fileURLToPath(new URL('../src',import.meta.url));
function javascriptFiles(directory){return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?javascriptFiles(join(directory,entry.name)):entry.name.endsWith('.js')?[join(directory,entry.name)]:[])}

test('every shipped JavaScript module parses without duplicate declarations',()=>{for(const file of javascriptFiles(root)){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});assert.equal(result.status,0,`${file}\n${result.stderr}`)}});
