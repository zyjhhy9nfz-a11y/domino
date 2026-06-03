import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

let game;

const setupDom = () => {
  document.body.innerHTML = '<div id="app"></div>';
};

describe('Dominoes gameplay automation', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    setupDom();
    game = await import('./main.js');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('renders the game interface', () => {
    expect(document.querySelector('#app')).toBeTruthy();
    expect(document.querySelector('button')).toBeTruthy();
  });

  it('starts with a player hand and spinner defined', () => {
    expect(game.playerHand.length).toBeGreaterThanOrEqual(6);
    expect(game.playerHand.length).toBeLessThanOrEqual(7);
    expect(game.board.spinner).toBeTruthy();
    expect(game.board.spinner[0]).not.toBeUndefined();
    expect(game.board.spinner[1]).not.toBeUndefined();
  });

  it('can play one valid tile onto a branch', () => {
    game.setGameState({
      isPlayerTurn: true,
      isGameOver: false,
      playerHand: [[6, 0], [1, 2], [3, 4]],
      board: {
        branches: { left: [], right: [], up: [], down: [] },
        spinner: [6, 6]
      },
      boneyard: []
    });

    const branch = 'left';
    const tile = game.playerHand[0];

    expect(game.isValidMove(tile, branch)).toBe(true);

    const initialHandSize = game.playerHand.length;
    game.playTileToBranch(branch, tile);

    expect(game.playerHand.length).toBe(initialHandSize - 1);
    expect(game.board.branches[branch].length).toBe(1);
    expect(game.board.branches[branch][0].tile).toEqual(tile);
  });
});