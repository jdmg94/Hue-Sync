import { promisify } from "util";
import * as fs from "fs";

const noop = () => void 0;
export const open = promisify(fs.open);
export const access = promisify(fs.access);
export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);
export const removeFile = promisify(fs.rm || fs.rmSync || noop);
