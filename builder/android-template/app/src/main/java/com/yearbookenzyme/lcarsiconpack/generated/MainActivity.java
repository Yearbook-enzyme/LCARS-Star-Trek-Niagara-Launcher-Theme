package com.yearbookenzyme.lcarsiconpack.generated;

import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        TextView view = new TextView(this);
        view.setText("LCARS Niagara Icons\n\nInstall this APK, then select it as an icon pack in Niagara Launcher.");
        view.setTextSize(18);
        view.setPadding(48, 48, 48, 48);
        setContentView(view);
    }
}
