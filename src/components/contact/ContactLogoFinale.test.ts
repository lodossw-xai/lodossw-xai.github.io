import { describe, expect, it } from 'vitest';
import { getLogoRenderProfile } from './ContactLogoFinale.profile';

describe('getLogoRenderProfile', () => {
  it('uses the full scene on capable desktop devices', () => {
    expect(
      getLogoRenderProfile({
        width: 1440,
        coarsePointer: false,
        hardwareConcurrency: 12,
        deviceMemory: 16,
      }).quality
    ).toBe('high');
  });

  it('reduces scene density for tablets and coarse pointers', () => {
    expect(
      getLogoRenderProfile({
        width: 900,
        coarsePointer: true,
        hardwareConcurrency: 8,
        deviceMemory: 8,
      }).quality
    ).toBe('medium');
  });

  it('uses the lightest scene for phones or data-saving mode', () => {
    expect(
      getLogoRenderProfile({
        width: 430,
        coarsePointer: true,
        hardwareConcurrency: 4,
        deviceMemory: 4,
      }).quality
    ).toBe('low');

    expect(
      getLogoRenderProfile({
        width: 1440,
        coarsePointer: false,
        hardwareConcurrency: 12,
        deviceMemory: 16,
        saveData: true,
      }).quality
    ).toBe('low');
  });
});
