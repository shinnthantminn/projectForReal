package com.panntheefoundation;

import com.reactnativenavigation.NavigationActivity;

import android.graphics.drawable.Drawable;
import androidx.core.content.ContextCompat;
import android.widget.LinearLayout;
import android.os.SystemClock;

import android.content.Intent;
import android.content.res.Configuration;

public class MainActivity extends NavigationActivity {
    @Override
    protected void addDefaultSplashLayout() {
        LinearLayout splash = new LinearLayout(this);
        Drawable splash_background = ContextCompat.getDrawable(getApplicationContext(), R.drawable.splash_screen_renderer);
        splash.setBackground(splash_background);
        setContentView(splash);
        // SystemClock.sleep(1000 * 1);
    }

    @Override
      public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        Intent intent = new Intent("onConfigurationChanged");
        intent.putExtra("newConfig", newConfig);
        this.sendBroadcast(intent);
    }
}
