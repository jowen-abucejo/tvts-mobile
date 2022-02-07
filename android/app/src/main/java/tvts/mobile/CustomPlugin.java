package tvts.mobile;

import android.content.Context;
import android.content.Intent;
import androidx.core.content.IntentCompat;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "RestartPlugin")
public class CustomPlugin extends Plugin {

  @PluginMethod()
  public void restart(PluginCall call) {
    String restart_type = call.getString("type");
    Context context = super.getContext();
    Intent mainIntent = IntentCompat.makeMainSelectorActivity(Intent.ACTION_MAIN, Intent.CATEGORY_LAUNCHER);
    mainIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    context.getApplicationContext().startActivity(mainIntent);
  }
}
