Grammar-Version: v2

procedure PROCESS_ITEMS:
  Contract:
    INPUT: items: list of Item
    OUTPUT: result: Result
    SUMMARY CALL:
      - mutates: items
      - aliases: output -> items
    SUMMARY RETURN:
      - ensures: count >= 0
      - return: Result | null
    PRE: true
    POST: true
    EFFECTS: pure
  RETURN result
