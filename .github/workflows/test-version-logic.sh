#!/bin/bash

# Test script to simulate the release workflow version detection logic
# This script helps validate the version detection and publishing decision logic

echo "=== Release Workflow Test Script ==="
echo ""

# Test function
test_version() {
    local VERSION=$1
    local TAG_MESSAGE=$2
    local COMMITS=$3
    
    echo "Testing Version: $VERSION"
    echo "Tag Message: $TAG_MESSAGE"
    echo "Commits: $COMMITS"
    echo ""
    
    # Parse version components
    MAJOR=$(echo $VERSION | cut -d. -f1)
    MINOR=$(echo $VERSION | cut -d. -f2)
    PATCH=$(echo $VERSION | cut -d. -f3)
    
    # Determine version type
    if [ "$MINOR" = "0" ] && [ "$PATCH" = "0" ]; then
        VERSION_TYPE="major"
    elif [ "$PATCH" = "0" ]; then
        VERSION_TYPE="minor"
    else
        VERSION_TYPE="patch"
    fi
    
    # Check if this is a bugfix release
    IS_BUGFIX="false"
    
    # Check commits for bug/fix keywords (case-insensitive) with word boundaries
    if echo "$COMMITS" | tr '[:upper:]' '[:lower:]' | grep -qE "\b(fix|bug|bugfix|hotfix|patch|repair|correct|resolve)(es|ed|ing|s)?\b"; then
        IS_BUGFIX="true"
    fi
    
    # Check tag message for bug/fix keywords (case-insensitive) with word boundaries
    if echo "$TAG_MESSAGE" | tr '[:upper:]' '[:lower:]' | grep -qE "\b(fix|bug|bugfix|hotfix|patch|repair|correct|resolve)(es|ed|ing|s)?\b"; then
        IS_BUGFIX="true"
    fi
    
    # Determine if we should publish to npm
    SHOULD_PUBLISH="false"
    
    if [ "$VERSION_TYPE" = "major" ]; then
        SHOULD_PUBLISH="true"
        REASON="Major version - always publish"
    elif [ "$VERSION_TYPE" = "minor" ] && [ "$IS_BUGFIX" = "true" ]; then
        SHOULD_PUBLISH="true"
        REASON="Minor version with bugfix"
    elif [ "$VERSION_TYPE" = "minor" ] && [ "$IS_BUGFIX" = "false" ]; then
        SHOULD_PUBLISH="false"
        REASON="Minor version without bugfix"
    elif [ "$VERSION_TYPE" = "patch" ] && [ "$IS_BUGFIX" = "true" ]; then
        SHOULD_PUBLISH="true"
        REASON="Patch version with bugfix"
    else
        SHOULD_PUBLISH="false"
        REASON="Default - no publish"
    fi
    
    echo "Results:"
    echo "  Version Type: $VERSION_TYPE"
    echo "  Is Bugfix: $IS_BUGFIX"
    echo "  Publish to npm: $SHOULD_PUBLISH"
    echo "  Reason: $REASON"
    echo ""
    echo "---"
    echo ""
}

# Test Case 1: Major version (always published)
test_version "2.0.0" "Major release v2.0.0 - Breaking API changes" "feat: Major refactoring"

# Test Case 2: Minor version with bugfix (published)
test_version "1.1.0" "Minor release v1.1.0 - New features and bug fixes" "feat: Add new feature\nfix: Resolve authentication issue"

# Test Case 3: Minor version without bugfix (NOT published)
test_version "1.2.0" "Minor release v1.2.0 - Add VM snapshot functionality" "feat: Add VM snapshots\nfeat: Improve logging"

# Test Case 4: Patch version with bugfix (published)
test_version "1.0.1" "Patch release v1.0.1 - Fix SSL certificate validation" "fix: Correct SSL certificate validation issue"

# Test Case 5: Patch version without bugfix keyword (NOT published)
test_version "1.0.2" "Patch release v1.0.2 - Update documentation" "docs: Update installation guide\nchore: Update dependencies"

# Test Case 6: Minor version with bugfix in tag message only
test_version "1.3.0" "Minor release v1.3.0 - Hotfix for memory leak" "feat: Add new container tools"

# Test Case 7: Minor version with fix in commits
test_version "1.4.0" "Minor release v1.4.0 - Improvements" "feat: Add storage tools\nfix: Correct timeout handling"

echo "=== All Tests Complete ==="
echo ""
echo "Summary of Publishing Rules:"
echo "1. Major versions (x.0.0): Always publish to npm"
echo "2. Minor versions (x.y.0): Publish only if bugfix detected"
echo "3. Patch versions (x.y.z): Publish only if bugfix detected"
echo ""
echo "Bugfix detection keywords (case-insensitive):"
echo "  fix, bug, bugfix, hotfix, patch, repair, correct, resolve"
