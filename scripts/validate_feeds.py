#!/usr/bin/env python3
"""Validate the built feeds with the W3C Feed Validator (w3c/feedvalidator).

Checks dist/rss.xml and dist/feed.xml at compatibility level "AA", which
mimics the online validator at https://validator.w3.org/feed/. Exits 1 when
any feed logs an error; warnings are printed but do not fail the build.

Requires: pip install html5lib rdflib, plus the w3c/feedvalidator sources on
PYTHONPATH (see the CI workflow: git clone ... /tmp/feedvalidator && PYTHONPATH=/tmp/feedvalidator/src).
"""

import sys

import feedvalidator
from feedvalidator import compatibility
from feedvalidator.formatter.text_plain import Formatter
from feedvalidator.logging import Error, ValidationFailure, Warning

BASE_URL = "https://blog.nergy.space/"
FEEDS = ["dist/rss.xml", "dist/feed.xml"]


def validate(feed: str) -> list:
    with open(feed, "rb") as fh:
        try:
            events = feedvalidator.validateStream(
                fh,
                firstOccurrenceOnly=1,
                base=BASE_URL + feed.split("/")[-1],
            )["loggedEvents"]
        except ValidationFailure as vf:
            events = [vf.event]
    return compatibility.AA(events)


def main() -> int:
    failed = False
    for feed in FEEDS:
        events = validate(feed)
        errors = [e for e in events if isinstance(e, Error)]
        warnings = [e for e in events if isinstance(e, Warning) and not isinstance(e, Error)]
        if errors:
            print(f"== {feed}: {len(errors)} error(s) ==")
            print("\n".join(Formatter(errors)))
            failed = True
        else:
            print(f"{feed}: valid (W3C Feed Validator, level AA, {len(warnings)} warning(s))")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
