import fs from 'fs';
import path from 'path';

export class PathError extends Error {
    constructor(message: string, public status = 400) {
        super(message);
    }
}

const within = (root: string, target: string): boolean =>
    target === root || target.startsWith(root.endsWith(path.sep) ? root : root + path.sep);

const nearestExisting = (target: string): string => {
    // target is inside an existing root, so this always stops at or below root
    let current = target;
    while (!fs.existsSync(current)) {
        current = path.dirname(current);
    }
    return current;
};

/**
 * Resolve a client supplied relative path inside root. Throws PathError if the
 * result escapes root, lexically or through a symlink.
 */
export const resolveInRoot = (root: string, rel: unknown = ''): string => {
    if (typeof rel !== 'string' || rel.includes('\0')) {
        throw new PathError('Invalid path');
    }
    const cleaned = rel.replace(/\\/g, '/');
    const realRoot = fs.realpathSync(root);
    const resolved = path.resolve(realRoot, '.' + path.sep + cleaned);
    if (!within(realRoot, resolved)) {
        throw new PathError('Path outside root', 403);
    }
    const existing = nearestExisting(resolved);
    if (!within(realRoot, fs.realpathSync(existing))) {
        throw new PathError('Path outside root', 403);
    }
    return resolved;
};

/** Validate a single file or folder name (no separators, not . or ..). */
export const cleanName = (name: unknown): string => {
    if (typeof name !== 'string') throw new PathError('Invalid name');
    const trimmed = name.trim();
    if (!trimmed || trimmed === '.' || trimmed === '..' || /[\\/\0]/.test(trimmed)) {
        throw new PathError('Invalid name');
    }
    return trimmed;
};
