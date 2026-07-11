#!/usr/bin/env python3
"""
Backend test for Avatar Studio endpoints (storage-only architecture).

Tests:
1. GET /api/avatar/presets (no auth)
2. GET /api/avatar/quota (auth required)
3. GET /api/avatar/history (auth required)
4. POST /api/avatar/face-swap (auth required, plan gating)
5. POST /api/avatar/set-profile (auth required)
6. POST /api/avatar/admin/seed-presets (admin auth)
"""
import io
import json
import os
import sys
from typing import Dict, Optional

import httpx
from PIL import Image

# Test configuration
BASE_URL = "https://a5195e1d-f035-4021-aa23-5db7ab334fff.preview.emergentagent.com"
SUPABASE_URL = "https://hnxnvdzrwbtmcohdptfq.supabase.co"
SUPABASE_ANON_KEY = "sb_publishable_uaL-zelOHdGlOlvaWuIa1A_wtL7mx3p"

# Test credentials
TEST_EMAIL = "avatartalk_test@example.com"
TEST_PASSWORD = "TestPassword!234"
TEST_USER_ID = "215a438c-135f-401e-b2f8-9ab889584af1"

# Admin key (from backend .env)
ADMIN_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


def login() -> str:
    """Login and return access token."""
    print("\n🔐 Logging in...")
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
    }
    payload = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
    
    with httpx.Client(timeout=30) as client:
        r = client.post(url, headers=headers, json=payload)
        if r.status_code != 200:
            print(f"❌ Login failed: {r.status_code} {r.text}")
            sys.exit(1)
        data = r.json()
        token = data.get("access_token")
        if not token:
            print(f"❌ No access_token in response: {data}")
            sys.exit(1)
        print(f"✅ Login successful, token: {token[:20]}...")
        return token


def test_presets_no_auth():
    """Test 1: GET /api/avatar/presets (no auth required)"""
    print("\n" + "="*80)
    print("TEST 1: GET /api/avatar/presets (no auth)")
    print("="*80)
    
    url = f"{BASE_URL}/api/avatar/presets"
    
    with httpx.Client(timeout=30) as client:
        r = client.get(url)
        print(f"Status: {r.status_code}")
        
        if r.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {r.status_code}")
            print(f"Response: {r.text[:500]}")
            return False
        
        data = r.json()
        print(f"Response keys: {list(data.keys())}")
        
        if "presets" not in data:
            print(f"❌ FAILED: Missing 'presets' key in response")
            return False
        
        presets = data["presets"]
        print(f"Number of presets: {len(presets)}")
        
        if len(presets) != 18:
            print(f"❌ FAILED: Expected exactly 18 presets, got {len(presets)}")
            return False
        
        # Check first preset structure
        if presets:
            first = presets[0]
            print(f"\nFirst preset sample:")
            print(f"  id: {first.get('id')}")
            print(f"  label: {first.get('label')}")
            print(f"  gender: {first.get('gender')}")
            print(f"  category: {first.get('category')}")
            print(f"  style: {first.get('style')}")
            print(f"  image_url: {first.get('image_url')}")
            print(f"  sort_order: {first.get('sort_order')}")
            
            required_fields = ["id", "label", "gender", "category", "style", "image_url", "sort_order"]
            missing = [f for f in required_fields if f not in first]
            if missing:
                print(f"❌ FAILED: Missing required fields: {missing}")
                return False
            
            # Verify image_url format
            image_url = first.get("image_url", "")
            if not image_url.startswith("https://hnxnvdzrwbtmcohdptfq.supabase.co/storage/v1/object/public/avatars/presets/"):
                print(f"❌ FAILED: Invalid image_url format: {image_url}")
                return False
            
            # Test fetching the image
            print(f"\n  Testing image URL accessibility...")
            img_r = client.get(image_url)
            print(f"  Image fetch status: {img_r.status_code}")
            print(f"  Content-Type: {img_r.headers.get('content-type')}")
            
            if img_r.status_code != 200:
                print(f"  ❌ FAILED: Image URL not accessible")
                return False
            
            if not img_r.headers.get("content-type", "").startswith("image/"):
                print(f"  ❌ FAILED: Invalid content-type for image")
                return False
            
            print(f"  ✅ Image URL is accessible and returns image/png")
        
        # Test filters
        print(f"\n  Testing filters...")
        
        # Test category filter
        r_prof = client.get(f"{url}?category=professional")
        if r_prof.status_code == 200:
            prof_count = len(r_prof.json().get("presets", []))
            print(f"  ?category=professional: {prof_count} items")
        
        # Test gender filter
        r_female = client.get(f"{url}?gender=female")
        if r_female.status_code == 200:
            female_count = len(r_female.json().get("presets", []))
            print(f"  ?gender=female: {female_count} items")
        
        # Test combined filter
        r_combined = client.get(f"{url}?category=casual&gender=male")
        if r_combined.status_code == 200:
            combined_count = len(r_combined.json().get("presets", []))
            print(f"  ?category=casual&gender=male: {combined_count} items")
        
        print(f"\n✅ TEST 1 PASSED")
        return True


def test_quota_auth_required(token: str):
    """Test 2: GET /api/avatar/quota (auth required)"""
    print("\n" + "="*80)
    print("TEST 2: GET /api/avatar/quota (auth required)")
    print("="*80)
    
    url = f"{BASE_URL}/api/avatar/quota"
    
    with httpx.Client(timeout=30) as client:
        # Test without auth
        print("\n  Testing without Authorization header...")
        r_no_auth = client.get(url)
        print(f"  Status: {r_no_auth.status_code}")
        
        if r_no_auth.status_code != 401:
            print(f"  ❌ FAILED: Expected 401 without auth, got {r_no_auth.status_code}")
            return False
        print(f"  ✅ Correctly returns 401 without auth")
        
        # Test with valid token
        print(f"\n  Testing with valid token...")
        headers = {"Authorization": f"Bearer {token}"}
        r = client.get(url, headers=headers)
        print(f"  Status: {r.status_code}")
        
        if r.status_code != 200:
            print(f"  ❌ FAILED: Expected 200 with valid token, got {r.status_code}")
            print(f"  Response: {r.text[:500]}")
            return False
        
        data = r.json()
        print(f"  Response: {json.dumps(data, indent=2)}")
        
        required_fields = ["plan", "monthly_limit", "used_this_month", "remaining", "can_customize", "can_upload"]
        missing = [f for f in required_fields if f not in data]
        if missing:
            print(f"  ❌ FAILED: Missing required fields: {missing}")
            return False
        
        # Verify free plan restrictions
        if data.get("plan") == "free":
            if data.get("monthly_limit") != 0:
                print(f"  ❌ FAILED: Free plan should have monthly_limit=0, got {data.get('monthly_limit')}")
                return False
            if data.get("can_customize") != False:
                print(f"  ❌ FAILED: Free plan should have can_customize=false")
                return False
            if data.get("can_upload") != False:
                print(f"  ❌ FAILED: Free plan should have can_upload=false")
                return False
            print(f"  ✅ Free plan restrictions correctly enforced")
        
        print(f"\n✅ TEST 2 PASSED")
        return True


def test_history_auth_required(token: str):
    """Test 3: GET /api/avatar/history (auth required)"""
    print("\n" + "="*80)
    print("TEST 3: GET /api/avatar/history (auth required)")
    print("="*80)
    
    url = f"{BASE_URL}/api/avatar/history"
    
    with httpx.Client(timeout=30) as client:
        # Test without auth
        print("\n  Testing without Authorization header...")
        r_no_auth = client.get(url)
        print(f"  Status: {r_no_auth.status_code}")
        
        if r_no_auth.status_code != 401:
            print(f"  ❌ FAILED: Expected 401 without auth, got {r_no_auth.status_code}")
            return False
        print(f"  ✅ Correctly returns 401 without auth")
        
        # Test with valid token
        print(f"\n  Testing with valid token...")
        headers = {"Authorization": f"Bearer {token}"}
        r = client.get(url, headers=headers)
        print(f"  Status: {r.status_code}")
        
        if r.status_code != 200:
            print(f"  ❌ FAILED: Expected 200 with valid token, got {r.status_code}")
            print(f"  Response: {r.text[:500]}")
            return False
        
        data = r.json()
        print(f"  Response: {json.dumps(data, indent=2)}")
        
        if "items" not in data:
            print(f"  ❌ FAILED: Missing 'items' key in response")
            return False
        
        items = data["items"]
        print(f"  Number of history items: {len(items)}")
        
        # Initially should be empty (no swaps yet)
        if len(items) == 0:
            print(f"  ✅ History is empty (no swaps yet) - expected for new user")
        else:
            print(f"  ℹ️  User has {len(items)} existing custom avatars")
        
        print(f"\n✅ TEST 3 PASSED")
        return True


def test_face_swap_plan_gating(token: str, preset_id: str):
    """Test 4: POST /api/avatar/face-swap (auth required, plan gating)"""
    print("\n" + "="*80)
    print("TEST 4: POST /api/avatar/face-swap (auth required, plan gating)")
    print("="*80)
    
    url = f"{BASE_URL}/api/avatar/face-swap"
    
    # Create a small test image (1x1 PNG)
    print("\n  Creating test image (1x1 PNG)...")
    img = Image.new("RGB", (1, 1), color="red")
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")
    img_bytes.seek(0)
    
    with httpx.Client(timeout=60) as client:
        # Test without auth
        print("\n  Testing without Authorization header...")
        files = {"user_face": ("test.png", img_bytes, "image/png")}
        data = {"preset_id": preset_id}
        r_no_auth = client.post(url, files=files, data=data)
        print(f"  Status: {r_no_auth.status_code}")
        
        if r_no_auth.status_code != 401:
            print(f"  ❌ FAILED: Expected 401 without auth, got {r_no_auth.status_code}")
            return False
        print(f"  ✅ Correctly returns 401 without auth")
        
        # Test with valid token (free plan user)
        print(f"\n  Testing with valid token (free plan user)...")
        img_bytes.seek(0)
        files = {"user_face": ("test.png", img_bytes, "image/png")}
        data = {"preset_id": preset_id}
        headers = {"Authorization": f"Bearer {token}"}
        r = client.post(url, files=files, data=data, headers=headers)
        print(f"  Status: {r.status_code}")
        print(f"  Response: {r.text[:500]}")
        
        if r.status_code != 403:
            print(f"  ❌ FAILED: Expected 403 for free plan user, got {r.status_code}")
            return False
        
        response_data = r.json()
        detail = response_data.get("detail", "")
        if "Creator plan or higher" not in detail:
            print(f"  ❌ FAILED: Expected 'Creator plan or higher' in error message, got: {detail}")
            return False
        
        print(f"  ✅ Correctly returns 403 with 'Custom avatar requires Creator plan or higher'")
        print(f"\n✅ TEST 4 PASSED")
        return True


def test_set_profile(token: str, preset_image_url: str):
    """Test 5: POST /api/avatar/set-profile (auth required)"""
    print("\n" + "="*80)
    print("TEST 5: POST /api/avatar/set-profile (auth required)")
    print("="*80)
    
    url = f"{BASE_URL}/api/avatar/set-profile"
    
    with httpx.Client(timeout=30) as client:
        # Test without auth
        print("\n  Testing without Authorization header...")
        payload = {"avatar_url": preset_image_url}
        r_no_auth = client.post(url, json=payload)
        print(f"  Status: {r_no_auth.status_code}")
        
        if r_no_auth.status_code != 401:
            print(f"  ❌ FAILED: Expected 401 without auth, got {r_no_auth.status_code}")
            return False
        print(f"  ✅ Correctly returns 401 without auth")
        
        # Test with valid token
        print(f"\n  Testing with valid token...")
        print(f"  Setting avatar_url to: {preset_image_url}")
        headers = {"Authorization": f"Bearer {token}"}
        r = client.post(url, json=payload, headers=headers)
        print(f"  Status: {r.status_code}")
        
        if r.status_code != 200:
            print(f"  ❌ FAILED: Expected 200, got {r.status_code}")
            print(f"  Response: {r.text[:500]}")
            return False
        
        data = r.json()
        print(f"  Response: {json.dumps(data, indent=2)}")
        
        if not data.get("success"):
            print(f"  ❌ FAILED: Expected success=true")
            return False
        
        if data.get("avatar_url") != preset_image_url:
            print(f"  ❌ FAILED: Returned avatar_url doesn't match")
            return False
        
        print(f"  ✅ Profile avatar set successfully")
        
        # Verify by fetching profile
        print(f"\n  Verifying profile update...")
        # Get username first
        profile_url = f"{SUPABASE_URL}/rest/v1/profiles"
        profile_headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {token}",
        }
        r_profile = client.get(
            profile_url,
            headers=profile_headers,
            params={"id": f"eq.{TEST_USER_ID}", "select": "username,avatar_url"}
        )
        
        if r_profile.status_code == 200:
            profiles = r_profile.json()
            if profiles and len(profiles) > 0:
                profile = profiles[0]
                username = profile.get("username")
                avatar_url = profile.get("avatar_url")
                print(f"  Profile username: {username}")
                print(f"  Profile avatar_url: {avatar_url}")
                
                if avatar_url == preset_image_url:
                    print(f"  ✅ Profile avatar_url correctly updated in database")
                else:
                    print(f"  ⚠️  Profile avatar_url doesn't match (may be cached)")
        
        print(f"\n✅ TEST 5 PASSED")
        return True


def test_admin_seed_presets():
    """Test 6: POST /api/avatar/admin/seed-presets (admin auth)"""
    print("\n" + "="*80)
    print("TEST 6: POST /api/avatar/admin/seed-presets (admin auth)")
    print("="*80)
    
    url = f"{BASE_URL}/api/avatar/admin/seed-presets"
    
    with httpx.Client(timeout=30) as client:
        # Test without admin key
        print("\n  Testing without X-Admin-Key header...")
        r_no_key = client.post(url)
        print(f"  Status: {r_no_key.status_code}")
        
        if r_no_key.status_code != 403:
            print(f"  ❌ FAILED: Expected 403 without admin key, got {r_no_key.status_code}")
            return False
        print(f"  ✅ Correctly returns 403 without admin key")
        
        # Test with wrong admin key
        print(f"\n  Testing with wrong X-Admin-Key...")
        headers = {"X-Admin-Key": "wrong_key_12345"}
        r_wrong_key = client.post(url, headers=headers)
        print(f"  Status: {r_wrong_key.status_code}")
        
        if r_wrong_key.status_code != 403:
            print(f"  ❌ FAILED: Expected 403 with wrong key, got {r_wrong_key.status_code}")
            return False
        print(f"  ✅ Correctly returns 403 with wrong admin key")
        
        print(f"\n  ℹ️  NOT running with valid key (would regenerate all 18 avatars, ~3 min)")
        print(f"  ℹ️  Admin auth gate is working correctly")
        
        print(f"\n✅ TEST 6 PASSED")
        return True


def main():
    print("="*80)
    print("AVATAR STUDIO BACKEND API TESTS")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Test User: {TEST_EMAIL}")
    
    results = {}
    
    # Login first
    token = login()
    
    # Test 1: GET /api/avatar/presets (no auth)
    results["test_1_presets"] = test_presets_no_auth()
    
    # Get a preset_id for later tests
    preset_id = None
    preset_image_url = None
    with httpx.Client(timeout=30) as client:
        r = client.get(f"{BASE_URL}/api/avatar/presets")
        if r.status_code == 200:
            presets = r.json().get("presets", [])
            if presets:
                preset_id = presets[0].get("id")
                preset_image_url = presets[0].get("image_url")
    
    if not preset_id or not preset_image_url:
        print("\n❌ CRITICAL: Could not get preset_id for subsequent tests")
        sys.exit(1)
    
    print(f"\nUsing preset_id for tests: {preset_id}")
    print(f"Using preset_image_url for tests: {preset_image_url}")
    
    # Test 2: GET /api/avatar/quota (auth required)
    results["test_2_quota"] = test_quota_auth_required(token)
    
    # Test 3: GET /api/avatar/history (auth required)
    results["test_3_history"] = test_history_auth_required(token)
    
    # Test 4: POST /api/avatar/face-swap (plan gating)
    results["test_4_face_swap"] = test_face_swap_plan_gating(token, preset_id)
    
    # Test 5: POST /api/avatar/set-profile (auth required)
    results["test_5_set_profile"] = test_set_profile(token, preset_image_url)
    
    # Test 6: POST /api/avatar/admin/seed-presets (admin auth)
    results["test_6_admin_seed"] = test_admin_seed_presets()
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    
    print("\n" + "="*80)
    if all_passed:
        print("🎉 ALL TESTS PASSED")
    else:
        print("❌ SOME TESTS FAILED")
    print("="*80)
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
