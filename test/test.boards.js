"use strict";

describe('boards', function(){
  describe('given a valid board identifier', function() {
    it('should return known board', function(){
      BOARD.find_board_definition('SRF3').name.should.equal('SP Racing F3');
    });
  });

  describe('given an invalid board identifier', function() {
    it('should return default board', function(){
      BOARD.find_board_definition('ABCD').name.should.equal('Unknown');
    });
  });
});
